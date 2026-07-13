"""Carga datos de demostracion con historial realista (ultimos 6 meses) para que los
dashboards del panel admin (WEB) tengan informacion coherente: pedidos, tickets, pagos,
gastos, cortes de caja, compras de suministro, inventario con alertas y notificaciones.

Requiere que `seed.py` ya se haya ejecutado (usuarios base, mesas, categorias, productos
iniciales). Si ya existen pedidos de demo, no vuelve a sembrar (idempotente).

Uso:
    python seed_demo.py
"""

import random
import uuid
from datetime import datetime, timedelta, timezone

from app import create_app
from app.extensions import db
from app.models.caja import Caja, CompraSuministro, CorteCaja, Gasto, Pago, Ticket
from app.models.ingrediente import Ingrediente, Receta
from app.models.inventario import AlertaStock
from app.models.mesa import Mesa
from app.models.notificacion import Notificacion
from app.models.pedido import DetallePedido, Pedido, PedidoEstadoHistorial
from app.models.producto import Categoria, Producto
from app.models.usuario import Usuario

app = create_app()

random.seed(42)


def dias_atras(dias, hora=12, minuto=0):
    # Naive (sin tzinfo): SQLite no conserva timezone, y los defaults del modelo
    # tambien se releen como naive tras un commit, asi que mantenemos consistencia.
    base = datetime.now(timezone.utc).replace(tzinfo=None)
    return (base - timedelta(days=dias)).replace(hour=hora, minute=minuto, second=0, microsecond=0)


with app.app_context():
    if Pedido.query.first():
        print("Ya existen pedidos de demostracion. No se vuelve a sembrar.")
        raise SystemExit(0)

    if not Usuario.query.first():
        print("Primero ejecuta 'python seed.py' para crear los usuarios y datos base.")
        raise SystemExit(1)

    # --- Usuarios adicionales (mas variedad para reportes) ---
    extra_usuarios = [
        dict(nombre="Sofia", apellido_paterno="Martinez", correo="mesero2@cafeteria.com", usuario="mesero2", rol="mesero", password="mesero123"),
        dict(nombre="Diego", apellido_paterno="Hernandez", correo="cocinero2@cafeteria.com", usuario="cocinero2", rol="cocinero", password="cocinero123"),
        dict(nombre="Laura", apellido_paterno="Torres", correo="cajero2@cafeteria.com", usuario="cajero2", rol="cajero", password="cajero123"),
    ]
    for u in extra_usuarios:
        if not Usuario.query.filter_by(usuario=u["usuario"]).first():
            nuevo = Usuario(nombre=u["nombre"], apellido_paterno=u["apellido_paterno"], correo=u["correo"], usuario=u["usuario"], rol=u["rol"])
            nuevo.set_password(u["password"])
            db.session.add(nuevo)
    db.session.commit()

    admin = Usuario.query.filter_by(usuario="admin").first()
    meseros = Usuario.query.filter_by(rol="mesero").all()
    cocineros = Usuario.query.filter_by(rol="cocinero").all()
    cajeros = Usuario.query.filter_by(rol="cajero").all()

    # --- Categorias / productos adicionales ---
    cat_bebidas = Categoria.query.filter_by(nombre="Bebidas Calientes").first()
    cat_frias = Categoria.query.filter_by(nombre="Bebidas Frias").first()
    cat_postres = Categoria.query.filter_by(nombre="Postres").first()

    productos_existentes = {p.nombre: p for p in Producto.query.all()}

    nuevos_productos = [
        dict(nombre="Latte Vainilla", descripcion="Espresso con leche vaporizada y jarabe de vainilla", precio=70, id_categoria=cat_bebidas.id_categoria),
        dict(nombre="Mocha", descripcion="Espresso, chocolate y leche vaporizada", precio=75, id_categoria=cat_bebidas.id_categoria),
        dict(nombre="Te Chai", descripcion="Te especiado con leche", precio=55, id_categoria=cat_bebidas.id_categoria),
        dict(nombre="Frappe Moka", descripcion="Cafe helado con chocolate y crema batida", precio=80, id_categoria=cat_frias.id_categoria),
        dict(nombre="Smoothie de Fresa", descripcion="Fresa, yogurt y hielo", precio=68, id_categoria=cat_frias.id_categoria),
        dict(nombre="Limonada Frappe", descripcion="Limonada natural con hielo frappe", precio=50, id_categoria=cat_frias.id_categoria),
        dict(nombre="Pay de Queso", descripcion="Rebanada de pay de queso con zarzamora", precio=60, id_categoria=cat_postres.id_categoria),
        dict(nombre="Muffin de Chocolate", descripcion="Muffin artesanal con chispas de chocolate", precio=42, id_categoria=cat_postres.id_categoria),
        dict(nombre="Croissant de Almendra", descripcion="Croissant relleno de crema de almendra", precio=48, id_categoria=cat_postres.id_categoria),
    ]
    for pdata in nuevos_productos:
        if pdata["nombre"] not in productos_existentes:
            nuevo = Producto(**pdata)
            db.session.add(nuevo)
    db.session.commit()

    productos = Producto.query.all()

    # --- Ingredientes adicionales (con stock variado, algunos bajos para alertas) ---
    ingredientes_existentes = {i.nombre: i for i in Ingrediente.query.all()}
    nuevos_ingredientes = [
        dict(nombre="Chocolate en polvo", unidad_medida="kg", stock_actual=1.2, stock_minimo=2),
        dict(nombre="Azucar", unidad_medida="kg", stock_actual=8, stock_minimo=3),
        dict(nombre="Hielo", unidad_medida="kg", stock_actual=4, stock_minimo=10),
        dict(nombre="Fresa", unidad_medida="kg", stock_actual=2.5, stock_minimo=3),
        dict(nombre="Harina", unidad_medida="kg", stock_actual=12, stock_minimo=5),
        dict(nombre="Mantequilla", unidad_medida="kg", stock_actual=1.8, stock_minimo=2),
        dict(nombre="Te chai (hojas)", unidad_medida="kg", stock_actual=0.8, stock_minimo=1),
        dict(nombre="Jarabe de vainilla", unidad_medida="L", stock_actual=0.6, stock_minimo=1),
        dict(nombre="Limon", unidad_medida="kg", stock_actual=5, stock_minimo=2),
    ]
    for idata in nuevos_ingredientes:
        if idata["nombre"] not in ingredientes_existentes:
            nuevo = Ingrediente(**idata)
            db.session.add(nuevo)
    db.session.commit()

    ingredientes = {i.nombre: i for i in Ingrediente.query.all()}

    recetas_nuevas = [
        ("Latte Vainilla", "Cafe en grano", 0.02), ("Latte Vainilla", "Leche entera", 0.15), ("Latte Vainilla", "Jarabe de vainilla", 0.03),
        ("Mocha", "Cafe en grano", 0.02), ("Mocha", "Leche entera", 0.12), ("Mocha", "Chocolate en polvo", 0.03),
        ("Te Chai", "Te chai (hojas)", 0.01), ("Te Chai", "Leche entera", 0.1),
        ("Frappe Moka", "Cafe en grano", 0.02), ("Frappe Moka", "Chocolate en polvo", 0.04), ("Frappe Moka", "Hielo", 0.2),
        ("Smoothie de Fresa", "Fresa", 0.15), ("Smoothie de Fresa", "Hielo", 0.15),
        ("Limonada Frappe", "Limon", 0.1), ("Limonada Frappe", "Hielo", 0.2), ("Limonada Frappe", "Azucar", 0.02),
        ("Pay de Queso", "Harina", 0.08), ("Pay de Queso", "Mantequilla", 0.05),
        ("Muffin de Chocolate", "Harina", 0.06), ("Muffin de Chocolate", "Chocolate en polvo", 0.03),
        ("Croissant de Almendra", "Harina", 0.07), ("Croissant de Almendra", "Mantequilla", 0.04),
    ]
    recetas_existentes = {(r.id_producto, r.id_ingrediente) for r in Receta.query.all()}
    productos_por_nombre = {p.nombre: p for p in productos}
    for nombre_prod, nombre_ing, cantidad in recetas_nuevas:
        prod = productos_por_nombre.get(nombre_prod)
        ing = ingredientes.get(nombre_ing)
        if prod and ing and (prod.id_producto, ing.id_ingrediente) not in recetas_existentes:
            db.session.add(Receta(id_producto=prod.id_producto, id_ingrediente=ing.id_ingrediente, cantidad_requerida=cantidad))
    db.session.commit()

    mesas = Mesa.query.order_by(Mesa.numero_mesa).all()

    # --- Cajas (turnos) distribuidos en los ultimos 6 meses, la mas reciente queda abierta ---
    cajas = []
    for mes_atras in range(5, -1, -1):
        fecha_apertura = dias_atras(mes_atras * 30 + 2, hora=8, minuto=0)
        cajero = random.choice(cajeros)
        caja = Caja(
            id_usuario=cajero.id_usuario,
            fondo_inicial=500,
            estado="cerrado",
            fecha_apertura=fecha_apertura,
            fecha_cierre=fecha_apertura + timedelta(hours=10),
            observaciones=f"Turno matutino - {fecha_apertura.strftime('%B %Y')}",
        )
        db.session.add(caja)
        cajas.append(caja)
    # Turno actual, abierto, para poder seguir probando desde Postman
    caja_hoy = Caja(id_usuario=random.choice(cajeros).id_usuario, fondo_inicial=500, estado="abierto", fecha_apertura=dias_atras(0, hora=8))
    db.session.add(caja_hoy)
    cajas.append(caja_hoy)
    db.session.commit()

    def caja_para_fecha(fecha):
        anteriores = [c for c in cajas if c.fecha_apertura <= fecha]
        return anteriores[-1] if anteriores else cajas[0]

    ESTADOS_DISTRIB = (
        ["entregado"] * 60 + ["cancelado"] * 8 + ["listo"] * 5 + ["en_preparacion"] * 4 + ["pendiente"] * 5
    )
    TIPOS_PAGO = ["efectivo"] * 5 + ["tarjeta"] * 4 + ["transferencia"] * 2

    def generar_numero_pedido():
        return f"PED-{uuid.uuid4().hex[:8].upper()}"

    def generar_folio():
        return f"TCK-{uuid.uuid4().hex[:8].upper()}"

    total_pedidos = 0
    total_tickets = 0

    # --- Pedidos distribuidos en los ultimos 180 dias ---
    for dia_offset in range(180, -1, -1):
        pedidos_del_dia = 1 if dia_offset > 3 else random.randint(2, 4)  # mas actividad en dias recientes
        if random.random() < 0.35 and dia_offset > 3:
            pedidos_del_dia = 0  # dias sin actividad (fines de semana cerrados, etc.)

        for _ in range(pedidos_del_dia):
            mesa = random.choice(mesas)
            mesero = random.choice(meseros)
            hora = random.randint(8, 20)
            minuto = random.choice([0, 15, 30, 45])
            fecha_creacion = dias_atras(dia_offset, hora=hora, minuto=minuto)

            if dia_offset <= 3:
                estado = random.choice(["pendiente", "en_preparacion", "listo", "entregado", "entregado"])
            else:
                estado = random.choice(ESTADOS_DISTRIB)

            n_items = random.randint(1, 3)
            elegidos = random.sample(productos, k=min(n_items, len(productos)))
            cantidades = [random.randint(1, 2) for _ in elegidos]
            total = sum(float(prod.precio) * cant for prod, cant in zip(elegidos, cantidades))

            pedido = Pedido(
                numero_pedido=generar_numero_pedido(),
                id_mesa=mesa.id_mesa,
                id_usuario=mesero.id_usuario,
                estado=estado,
                total=total,
                fecha_creacion=fecha_creacion,
                fecha_actualizacion=fecha_creacion + timedelta(minutes=random.randint(10, 40)),
                metodo_pago=random.choice(["efectivo", "tarjeta", "transferencia"]) if estado in ("entregado", "listo") else None,
                observaciones=random.choice([None, None, None, "Sin azucar", "Extra caliente", "Para llevar"]),
            )
            db.session.add(pedido)
            db.session.flush()

            for prod, cantidad in zip(elegidos, cantidades):
                subtotal = float(prod.precio) * cantidad
                db.session.add(DetallePedido(
                    id_pedido=pedido.id_pedido, id_producto=prod.id_producto,
                    cantidad=cantidad, precio_unitario=prod.precio, subtotal=subtotal,
                ))

            db.session.add(PedidoEstadoHistorial(
                id_pedido=pedido.id_pedido, estado_anterior=None, estado_nuevo="pendiente",
                id_usuario=mesero.id_usuario, fecha_cambio=fecha_creacion,
            ))
            if estado != "pendiente":
                db.session.add(PedidoEstadoHistorial(
                    id_pedido=pedido.id_pedido, estado_anterior="pendiente", estado_nuevo=estado,
                    id_usuario=random.choice(cocineros).id_usuario, fecha_cambio=fecha_creacion + timedelta(minutes=15),
                ))
            total_pedidos += 1

            # Ticket + pago solo para pedidos cobrados (entregado / listo)
            if estado in ("entregado", "listo"):
                caja_asociada = caja_para_fecha(fecha_creacion)
                cajero = db.session.get(Usuario, caja_asociada.id_usuario)
                impuesto = round(total * 0.16, 2)
                fecha_ticket = fecha_creacion + timedelta(minutes=20)
                ticket = Ticket(
                    folio=generar_folio(), id_pedido=pedido.id_pedido, id_caja=caja_asociada.id_caja,
                    id_usuario=cajero.id_usuario, fecha=fecha_ticket, total=total + impuesto,
                    impuesto=impuesto, descuento=0, estado="pagado",
                )
                db.session.add(ticket)
                db.session.flush()
                tipo_pago = random.choice(TIPOS_PAGO)
                monto = float(total) + impuesto
                db.session.add(Pago(
                    id_ticket=ticket.id_ticket, monto=monto, tipo_pago=tipo_pago,
                    fecha_pago=fecha_ticket, cambio=round(random.uniform(0, 20), 2) if tipo_pago == "efectivo" else 0,
                ))
                total_tickets += 1

    db.session.commit()
    print(f"Pedidos creados: {total_pedidos} | Tickets pagados: {total_tickets}")

    # --- Cortes de caja para turnos cerrados ---
    for caja in cajas:
        if caja.estado != "cerrado":
            continue
        tickets_caja = Ticket.query.filter_by(id_caja=caja.id_caja, estado="pagado").all()
        total_efectivo = sum(float(p.monto) for t in tickets_caja for p in t.pagos if p.tipo_pago == "efectivo")
        total_tarjeta = sum(float(p.monto) for t in tickets_caja for p in t.pagos if p.tipo_pago == "tarjeta")
        total_transferencia = sum(float(p.monto) for t in tickets_caja for p in t.pagos if p.tipo_pago == "transferencia")
        db.session.add(CorteCaja(
            id_caja=caja.id_caja, id_usuario=caja.id_usuario, fecha_corte=caja.fecha_cierre,
            total_ventas=total_efectivo + total_tarjeta + total_transferencia,
            total_efectivo=total_efectivo, total_tarjeta=total_tarjeta, total_transferencia=total_transferencia,
            diferencia=0,
        ))
    db.session.commit()

    # --- Gastos distribuidos en los ultimos 6 meses ---
    conceptos_gastos = [
        ("Insumos", "Compra de cafe en grano"), ("Insumos", "Compra de leche y lacteos"),
        ("Insumos", "Compra de fruta fresca"), ("Servicios", "Pago de luz"),
        ("Servicios", "Pago de agua"), ("Servicios", "Internet y telefonia"),
        ("Mantenimiento", "Servicio de la maquina de espresso"), ("Mantenimiento", "Reparacion de refrigerador"),
        ("Nomina", "Pago extra por turno doble"), ("Marketing", "Publicidad en redes sociales"),
        ("Papeleria", "Vasos y servilletas desechables"), ("Papeleria", "Tickets y rollos de papel"),
    ]
    n_gastos = 0
    for dia_offset in range(180, -1, -1):
        if random.random() < 0.85:
            continue  # no todos los dias hay gasto
        categoria, concepto = random.choice(conceptos_gastos)
        monto = round(random.uniform(150, 3500), 2)
        usuario_gasto = random.choice(cajeros + [admin])
        fecha_gasto = dias_atras(dia_offset, hora=random.randint(9, 18))
        caja_asociada = caja_para_fecha(fecha_gasto)
        db.session.add(Gasto(
            id_caja=caja_asociada.id_caja, id_usuario=usuario_gasto.id_usuario, concepto=concepto,
            monto=monto, categoria=categoria, fecha=fecha_gasto,
            comprobante=f"FAC-{random.randint(1000,9999)}" if random.random() < 0.6 else None,
        ))
        n_gastos += 1
    db.session.commit()
    print(f"Gastos creados: {n_gastos}")

    # --- Compras de suministro ---
    proveedores = ["Cafe del Valle S.A.", "Lacteos La Hacienda", "Distribuidora Fruver", "Panificadora Central", "Desechables MX"]
    for i in range(10):
        dia_offset = random.randint(0, 170)
        fecha_compra = dias_atras(dia_offset, hora=random.randint(9, 16))
        caja_asociada = caja_para_fecha(fecha_compra)
        db.session.add(CompraSuministro(
            id_caja=caja_asociada.id_caja, id_usuario=random.choice(cajeros).id_usuario,
            proveedor=random.choice(proveedores), total=round(random.uniform(500, 6000), 2),
            fecha=fecha_compra, estado=random.choice(["pendiente", "recibido", "recibido", "recibido"]),
            factura=f"FAC-SUM-{1000+i}", notas="Pedido mensual de insumos" if i % 2 == 0 else None,
        ))
    db.session.commit()
    print("Compras de suministro creadas: 10")

    # --- Notificaciones recientes (pedidos listos, alertas de stock) ---
    pedidos_recientes_listos = Pedido.query.filter(Pedido.estado.in_(["listo", "entregado"])).order_by(Pedido.fecha_creacion.desc()).limit(6).all()
    for p in pedidos_recientes_listos:
        db.session.add(Notificacion(
            id_pedido=p.id_pedido, tipo="pedido_listo",
            mensaje=f"El pedido {p.numero_pedido} esta listo para entregar.",
            id_receptor=p.id_usuario, estado=random.choice(["enviada", "leida"]),
            fecha_envio=p.fecha_creacion + timedelta(minutes=18),
        ))
    ingredientes_bajos = Ingrediente.query.filter(Ingrediente.stock_actual < Ingrediente.stock_minimo).all()
    for idx, ing in enumerate(ingredientes_bajos):
        db.session.add(Notificacion(
            tipo="stock_bajo", mensaje=f"Stock bajo de {ing.nombre}: {ing.stock_actual} {ing.unidad_medida} disponibles.",
            id_receptor=admin.id_usuario, estado="enviada", fecha_envio=dias_atras(0, hora=9),
        ))
        # La primera mitad queda pendiente de atender; el resto simula alertas ya resueltas.
        atendida = idx >= len(ingredientes_bajos) // 2
        db.session.add(AlertaStock(
            id_ingrediente=ing.id_ingrediente, stock_actual=ing.stock_actual, stock_minimo=ing.stock_minimo,
            fecha_alerta=dias_atras(random.randint(0, 5), hora=9),
            atendida=atendida, fecha_atendida=dias_atras(random.randint(0, 2), hora=15) if atendida else None,
        ))
    db.session.commit()
    print(f"Alertas de stock creadas: {len(ingredientes_bajos)}")

    print("\nDatos de demostracion creados correctamente.")
    print(f"Usuarios extra: mesero2/mesero123, cocinero2/cocinero123, cajero2/cajero123")
    print(f"Productos totales: {Producto.query.count()} | Ingredientes totales: {Ingrediente.query.count()}")
    print(f"Pedidos: {Pedido.query.count()} | Tickets pagados: {Ticket.query.filter_by(estado='pagado').count()}")
    print(f"Gastos: {Gasto.query.count()} | Cortes de caja: {CorteCaja.query.count()} | Compras: {CompraSuministro.query.count()}")
    print(f"Caja abierta actualmente: id_caja={caja_hoy.id_caja} (usar para nuevos tickets desde Postman)")
