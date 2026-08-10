"""
Cierra los pedidos de prueba que quedaron atorados y mantienen mesas ocupadas.

Los datos sembrados crearon pedidos en estados intermedios (pendiente, en_cocina,
en_preparacion, listo) que nunca avanzaron. Como una mesa sigue ocupada mientras le
quede un pedido sin cobrar ni cancelar, esos pedidos viejos dejan mesas ocupadas para
siempre y hacen que aparezcan varios pedidos "en preparacion" en la misma mesa.

Los marca como cancelados dejando constancia en el historial, no los borra: las
estadisticas del panel web siguen viendo que existieron.

Uso:
    docker compose exec api python limpiar_pedidos_atorados.py           # simula
    docker compose exec api python limpiar_pedidos_atorados.py --aplicar # aplica
    docker compose exec api python limpiar_pedidos_atorados.py --dias 7 --aplicar
"""

import argparse
from datetime import datetime, timedelta, timezone

from app.core.mesas import liberar_mesa_si_corresponde
from app.database import SessionLocal
from app.models.pedido import Pedido, PedidoEstadoHistorial

ESTADOS_ATORABLES = ("pendiente", "en_cocina", "en_preparacion", "listo")
MOTIVO = "Cierre automatico: pedido de prueba que quedo sin avanzar"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dias", type=int, default=1,
        help="Antiguedad minima en dias para considerar un pedido atorado (por defecto 1)",
    )
    parser.add_argument("--aplicar", action="store_true", help="Sin esto solo simula")
    args = parser.parse_args()

    limite = datetime.now(timezone.utc) - timedelta(days=args.dias)
    db = SessionLocal()

    try:
        atorados = (
            db.query(Pedido)
            .filter(Pedido.estado.in_(ESTADOS_ATORABLES), Pedido.fecha_creacion < limite)
            .order_by(Pedido.fecha_creacion)
            .all()
        )

        if not atorados:
            print(f"No hay pedidos atorados de mas de {args.dias} dia(s).")
            return

        print(f"Pedidos atorados de mas de {args.dias} dia(s): {len(atorados)}")
        for p in atorados:
            mesa = f"mesa {p.mesa.numero_mesa}" if p.mesa else "para llevar"
            fecha = p.fecha_creacion.date() if p.fecha_creacion else "sin fecha"
            print(f"  #{p.id_pedido:>4}  {p.estado:<15} {str(fecha):<12} {mesa}")

        if not args.aplicar:
            print("\nSimulacion: no se modifico nada. Agrega --aplicar para cerrarlos.")
            return

        for p in atorados:
            estado_anterior = p.estado
            p.estado = "cancelado"
            p.fecha_actualizacion = datetime.now(timezone.utc)
            db.add(
                PedidoEstadoHistorial(
                    id_pedido=p.id_pedido,
                    estado_anterior=estado_anterior,
                    estado_nuevo="cancelado",
                    id_usuario=p.id_usuario,
                    comentario=MOTIVO,
                )
            )

        db.flush()
        for p in atorados:
            liberar_mesa_si_corresponde(db, p)

        db.commit()
        print(f"\nListo: {len(atorados)} pedidos cerrados y mesas revisadas.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
