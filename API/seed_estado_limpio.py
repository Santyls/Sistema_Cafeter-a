"""
Deja la base en un estado coherente con el flujo actual, listo para probar.

Que conserva:
  - Los pedidos ya cobrados y sus tickets, para que el historial y las estadisticas
    del panel web sigan teniendo de donde salir.
  - Usuarios, mesas, productos, categorias, ingredientes y recetas.

Que limpia:
  - Los pedidos que quedaron a medias (pendiente, en_cocina, en_preparacion, listo) y
    los entregados sin cobrar. Eran los que dejaban mesas ocupadas sin que cocina ni
    caja vieran nada, porque los datos sembrados nunca recorrieron el flujo completo.
  - Notificaciones y turnos de caja abiertos, que apuntaban a esos pedidos.
  - Todas las mesas quedan disponibles.

Uso:
    docker compose exec api python seed_estado_limpio.py            # simula
    docker compose exec api python seed_estado_limpio.py --aplicar  # aplica
"""

import argparse

from sqlalchemy import text

from app.database import SessionLocal

ESTADOS_EN_VUELO = ("pendiente", "en_cocina", "en_preparacion", "listo")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--aplicar", action="store_true", help="Sin esto solo simula")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        # Un pedido se considera cerrado cuando tiene ticket pagado: ese es el historial
        # que vale la pena conservar.
        cerrados = db.execute(
            text(
                "SELECT COUNT(DISTINCT id_pedido) FROM tickets "
                "WHERE estado = 'pagado' AND id_pedido IS NOT NULL"
            )
        ).scalar()

        por_borrar = db.execute(
            text(
                "SELECT COUNT(*) FROM pedidos p WHERE p.id_pedido NOT IN "
                "(SELECT id_pedido FROM tickets WHERE estado='pagado' AND id_pedido IS NOT NULL)"
            )
        ).scalar()

        mesas_ocupadas = db.execute(
            text("SELECT COUNT(*) FROM mesas WHERE estado <> 'disponible'")
        ).scalar()

        print("Estado actual")
        print(f"  Pedidos cobrados que se conservan : {cerrados}")
        print(f"  Pedidos sin cobrar que se eliminan: {por_borrar}")
        print(f"  Mesas no disponibles              : {mesas_ocupadas}")

        if not args.aplicar:
            print("\nSimulacion: no se modifico nada. Agrega --aplicar para ejecutarlo.")
            return

        pagados = (
            "(SELECT id_pedido FROM tickets WHERE estado='pagado' AND id_pedido IS NOT NULL)"
        )

        # El orden respeta las llaves foraneas: primero lo que apunta al pedido.
        db.execute(
            text(f"DELETE FROM pedido_estado_historial WHERE id_pedido NOT IN {pagados}")
        )
        db.execute(text(f"DELETE FROM detalle_pedido WHERE id_pedido NOT IN {pagados}"))
        db.execute(text(f"DELETE FROM notificaciones WHERE id_pedido NOT IN {pagados}"))
        # Los tickets sin pagar apuntan a pedidos que se van: se eliminan con ellos.
        db.execute(text("DELETE FROM pagos WHERE id_ticket IN (SELECT id_ticket FROM tickets WHERE estado <> 'pagado')"))
        db.execute(text("DELETE FROM tickets WHERE estado <> 'pagado'"))
        borrados = db.execute(text(f"DELETE FROM pedidos WHERE id_pedido NOT IN {pagados}")).rowcount

        # Avisos sueltos que ya no corresponden a nada en curso.
        db.execute(text("DELETE FROM notificaciones WHERE id_pedido IS NULL"))

        # Turnos de caja abiertos: se cierran para empezar limpio.
        cajas = db.execute(
            text("UPDATE caja SET estado='cerrado', fecha_cierre=NOW() WHERE estado='abierto'")
        ).rowcount

        # Con todo cobrado o eliminado, ninguna mesa tiene cuenta abierta.
        mesas = db.execute(text("UPDATE mesas SET estado='disponible' WHERE estado <> 'disponible'")).rowcount

        db.commit()

        print("\nListo:")
        print(f"  Pedidos eliminados      : {borrados}")
        print(f"  Turnos de caja cerrados : {cajas}")
        print(f"  Mesas liberadas         : {mesas}")
        print(f"  Pedidos conservados     : {cerrados} (con su ticket pagado)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
