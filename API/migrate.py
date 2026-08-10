"""
Migraciones de esquema para bases de datos que ya tienen informacion.

`Base.metadata.create_all()` crea tablas nuevas pero NUNCA altera las existentes, asi
que los cambios de columnas se aplican aqui. El script es idempotente: se puede correr
las veces que sea sin romper nada.

Uso:  docker compose exec api python migrate.py
"""

from sqlalchemy import text

from app.database import engine


def _columna_existe(conn, tabla: str, columna: str) -> bool:
    return conn.execute(
        text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name = :tabla AND column_name = :columna"
        ),
        {"tabla": tabla, "columna": columna},
    ).first() is not None


def migrar():
    with engine.begin() as conn:
        pasos = []

        # --- pedidos: pedidos para llevar y solicitud de cuenta ---
        conn.execute(text("ALTER TABLE pedidos ALTER COLUMN id_mesa DROP NOT NULL"))
        pasos.append("pedidos.id_mesa ahora acepta NULL (pedidos para llevar)")

        if not _columna_existe(conn, "pedidos", "tipo_pedido"):
            conn.execute(
                text(
                    "ALTER TABLE pedidos ADD COLUMN tipo_pedido VARCHAR(20) NOT NULL DEFAULT 'mesa'"
                )
            )
            pasos.append("pedidos.tipo_pedido agregada")

        if not _columna_existe(conn, "pedidos", "cuenta_solicitada"):
            conn.execute(
                text(
                    "ALTER TABLE pedidos ADD COLUMN cuenta_solicitada BOOLEAN NOT NULL DEFAULT FALSE"
                )
            )
            conn.execute(text("ALTER TABLE pedidos ADD COLUMN fecha_cuenta_solicitada TIMESTAMPTZ"))
            pasos.append("pedidos.cuenta_solicitada y fecha_cuenta_solicitada agregadas")

        # Los pedidos historicos ya cobrados se dan por solicitados, para que no aparezcan
        # como pendientes de cobro en caja.
        actualizados = conn.execute(
            text(
                "UPDATE pedidos SET cuenta_solicitada = TRUE "
                "WHERE cuenta_solicitada = FALSE AND id_pedido IN "
                "(SELECT id_pedido FROM tickets WHERE estado = 'pagado' AND id_pedido IS NOT NULL)"
            )
        ).rowcount
        if actualizados:
            pasos.append(f"{actualizados} pedidos ya cobrados marcados con cuenta solicitada")

        # El estado 'entregado_pagado' desaparece: el cobro vive en el ticket.
        renombrados = conn.execute(
            text("UPDATE pedidos SET estado = 'entregado' WHERE estado = 'entregado_pagado'")
        ).rowcount
        if renombrados:
            pasos.append(f"{renombrados} pedidos 'entregado_pagado' pasados a 'entregado'")

        # --- reservaciones: fecha y hora de texto a un instante real ---
        if not _columna_existe(conn, "reservaciones", "fecha_hora"):
            conn.execute(text("ALTER TABLE reservaciones ADD COLUMN fecha_hora TIMESTAMPTZ"))
            conn.execute(
                text("ALTER TABLE reservaciones ADD COLUMN numero_personas INTEGER NOT NULL DEFAULT 1")
            )

            # Convierte los textos existentes; los que no se puedan interpretar quedan NULL
            # y se descartan abajo en lugar de romper la migracion.
            conn.execute(
                text(
                    "UPDATE reservaciones SET fecha_hora = "
                    "to_timestamp(replace(fecha, '/', '-') || ' ' || hora, 'YYYY-MM-DD HH24:MI') "
                    "WHERE fecha_hora IS NULL"
                )
            )
            descartadas = conn.execute(
                text("DELETE FROM reservaciones WHERE fecha_hora IS NULL")
            ).rowcount

            conn.execute(text("ALTER TABLE reservaciones ALTER COLUMN fecha_hora SET NOT NULL"))
            conn.execute(text("ALTER TABLE reservaciones DROP COLUMN fecha"))
            conn.execute(text("ALTER TABLE reservaciones DROP COLUMN hora"))

            pasos.append("reservaciones.fecha_hora creada a partir de fecha + hora")
            if descartadas:
                pasos.append(f"{descartadas} reservaciones con fecha ilegible descartadas")

    if pasos:
        print("Migracion aplicada:")
        for paso in pasos:
            print(f"  - {paso}")
    else:
        print("La base de datos ya estaba al dia.")


if __name__ == "__main__":
    migrar()
