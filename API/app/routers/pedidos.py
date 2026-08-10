import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.mesas import liberar_mesa_si_corresponde
from ..core.security import get_claims, roles_required
from ..database import get_db
from ..models.caja import Ticket
from ..models.inventario import AlertaStock, InventarioMovimiento
from ..models.mesa import Mesa
from ..models.notificacion import Notificacion
from ..models.pedido import (
    ESTADOS_PEDIDO,
    TIPOS_PEDIDO,
    DetallePedido,
    Pedido,
    PedidoEstadoHistorial,
)
from ..models.producto import Producto
from ..models.reservacion import Reservacion
from ..models.usuario import Usuario
from ..schemas.common import MessageOut
from ..schemas.pedido import (
    DisponibilidadIn,
    DisponibilidadOut,
    EstadoPedidoIn,
    HistorialOut,
    InyeccionIn,
    PedidoCompletoOut,
    PedidoConDetallesOut,
    PedidoCreate,
    PedidoOut,
    PedidoUpdate,
)

router = APIRouter(prefix="/api/pedidos", tags=["Pedidos"])

ESTADOS_BLOQUEADOS_PARA_EDITAR = ("listo", "entregado", "cancelado")
ESTADOS_ACTIVOS = ("pendiente", "en_cocina", "en_preparacion", "listo")

# --- Maquina de estados: transiciones permitidas desde cada estado ---
TRANSICIONES_VALIDAS = {
    "pendiente": {"en_cocina", "cancelado"},
    "en_cocina": {"en_preparacion", "cancelado"},
    "en_preparacion": {"listo", "cancelado"},
    "listo": {"entregado", "cancelado"},
    "entregado": set(),
    "cancelado": set(),
}

# Roles autorizados para llevar un pedido a cada estado destino.
ROLES_POR_ESTADO_DESTINO = {
    "en_cocina": {"admin", "cajero"},
    "en_preparacion": {"admin", "cocinero"},
    "listo": {"admin", "cocinero"},
    "entregado": {"admin", "mesero", "cajero"},
    "cancelado": {"admin", "mesero", "cajero", "cocinero"},
}

# Desde que estados puede cancelar cada rol (RF-55: el mesero no cancela en preparacion).
CANCELACION_POR_ROL = {
    "admin": {"pendiente", "en_cocina", "en_preparacion", "listo"},
    "cajero": {"pendiente", "en_cocina", "en_preparacion", "listo"},
    "cocinero": {"en_cocina", "en_preparacion"},
    "mesero": {"pendiente"},
}


# Una mesa deja de estar disponible este tiempo antes de su reservacion, para que no
# se le asigne un pedido que no alcanzaria a consumirse antes de que llegue el cliente.
MINUTOS_BLOQUEO_RESERVACION = 90


def _generar_numero_pedido():
    return f"PED-{uuid.uuid4().hex[:8].upper()}"


def _describir_origen(pedido: Pedido, mesa: Mesa | None = None) -> str:
    """Texto para los mensajes: 'Mesa 4' o 'Para llevar'."""
    if pedido.tipo_pedido == "para_llevar":
        return "Para llevar"
    numero = mesa.numero_mesa if mesa else (pedido.mesa.numero_mesa if pedido.mesa else pedido.id_mesa)
    return f"Mesa {numero}"


def _tiene_reservacion_proxima(db: Session, id_mesa: int) -> bool:
    """True si la mesa tiene una reservacion dentro de la ventana de bloqueo."""
    ahora = datetime.now(timezone.utc)
    limite = ahora + timedelta(minutes=MINUTOS_BLOQUEO_RESERVACION)

    return (
        db.query(Reservacion)
        .filter(
            Reservacion.id_mesa == id_mesa,
            Reservacion.fecha_hora >= ahora,
            Reservacion.fecha_hora <= limite,
        )
        .count()
        > 0
    )


def _faltantes_de_inventario(detalles) -> list[dict]:
    """
    Ingredientes que no alcanzan para preparar los productos indicados.

    Devuelve una lista con el ingrediente, cuanto se requiere, cuanto hay y cuanto falta,
    para que la app pueda decir exactamente que no se puede preparar y por que.
    Los productos sin receta no consumen inventario, asi que nunca aparecen aqui.
    """
    requerido_por_ingrediente = defaultdict(float)
    ingredientes = {}
    productos_por_ingrediente = defaultdict(set)

    for detalle in detalles:
        producto = detalle.producto
        for receta in producto.recetas:
            requerido = float(receta.cantidad_requerida) * detalle.cantidad
            requerido_por_ingrediente[receta.id_ingrediente] += requerido
            ingredientes[receta.id_ingrediente] = receta.ingrediente
            productos_por_ingrediente[receta.id_ingrediente].add(producto.nombre)

    faltantes = []
    for id_ing, requerido in requerido_por_ingrediente.items():
        ingrediente = ingredientes[id_ing]
        disponible = float(ingrediente.stock_actual or 0)
        if disponible < requerido:
            faltantes.append(
                {
                    "ingrediente": ingrediente.nombre,
                    "unidad": ingrediente.unidad_medida,
                    "requerido": round(requerido, 3),
                    "disponible": round(disponible, 3),
                    "falta": round(requerido - disponible, 3),
                    "productos": sorted(productos_por_ingrediente[id_ing]),
                }
            )

    return faltantes


def _texto_faltantes(faltantes: list[dict]) -> str:
    partes = [
        f"{f['ingrediente']}: faltan {f['falta']:g} {f['unidad']} "
        f"(se requieren {f['requerido']:g}, hay {f['disponible']:g}) para {', '.join(f['productos'])}"
        for f in faltantes
    ]
    return "; ".join(partes)


def _descontar_inventario(db: Session, pedido: Pedido, id_usuario: int):
    """Descuenta ingredientes segun receta de cada producto del pedido y genera alertas de stock bajo."""
    for detalle in pedido.detalles:
        for receta in detalle.producto.recetas:
            ingrediente = receta.ingrediente
            stock_anterior = ingrediente.stock_actual
            cantidad_usada = receta.cantidad_requerida * detalle.cantidad
            ingrediente.stock_actual = float(stock_anterior) - float(cantidad_usada)

            db.add(
                InventarioMovimiento(
                    id_ingrediente=ingrediente.id_ingrediente,
                    tipo_movimiento="salida",
                    cantidad=cantidad_usada,
                    stock_anterior=stock_anterior,
                    stock_nuevo=ingrediente.stock_actual,
                    id_usuario=id_usuario,
                    referencia=f"pedido:{pedido.id_pedido}",
                    observaciones=f"Descuento automatico por pedido {pedido.numero_pedido}",
                )
            )

            if float(ingrediente.stock_actual) < float(ingrediente.stock_minimo):
                db.add(
                    AlertaStock(
                        id_ingrediente=ingrediente.id_ingrediente,
                        stock_actual=ingrediente.stock_actual,
                        stock_minimo=ingrediente.stock_minimo,
                    )
                )


def _reponer_inventario(db: Session, pedido: Pedido, id_usuario: int):
    """Devuelve al inventario los ingredientes descontados de un pedido que se cancela ya estando listo."""
    for detalle in pedido.detalles:
        for receta in detalle.producto.recetas:
            ingrediente = receta.ingrediente
            stock_anterior = ingrediente.stock_actual
            cantidad_repuesta = receta.cantidad_requerida * detalle.cantidad
            ingrediente.stock_actual = float(stock_anterior) + float(cantidad_repuesta)

            db.add(
                InventarioMovimiento(
                    id_ingrediente=ingrediente.id_ingrediente,
                    tipo_movimiento="entrada",
                    cantidad=cantidad_repuesta,
                    stock_anterior=stock_anterior,
                    stock_nuevo=ingrediente.stock_actual,
                    id_usuario=id_usuario,
                    referencia=f"pedido:{pedido.id_pedido}",
                    observaciones=f"Reposicion por cancelacion del pedido {pedido.numero_pedido}",
                )
            )


def _notificar_rol(db: Session, rol: str, tipo: str, mensaje: str, id_pedido: int | None = None):
    """Crea una notificacion para cada usuario activo con el rol indicado."""
    receptores = db.query(Usuario).filter_by(rol=rol, activo=True).all()
    for receptor in receptores:
        db.add(
            Notificacion(
                id_pedido=id_pedido,
                tipo=tipo,
                mensaje=mensaje,
                id_receptor=receptor.id_usuario,
            )
        )


def _validar_ticket_no_pagado(db: Session, pedido: Pedido):
    ticket_pagado = db.query(Ticket).filter_by(id_pedido=pedido.id_pedido, estado="pagado").first()
    if ticket_pagado:
        raise HTTPException(
            status_code=409,
            detail=f"No se puede cancelar: el pedido ya tiene un ticket pagado ({ticket_pagado.folio})",
        )


@router.get("", response_model=list[PedidoOut])
def listar_pedidos(
    estado: str | None = Query(default=None),
    id_mesa: int | None = Query(default=None),
    id_usuario: int | None = Query(default=None),
    claims: dict = Depends(get_claims),
    db: Session = Depends(get_db),
):
    query = db.query(Pedido)
    if estado:
        query = query.filter_by(estado=estado)
    if id_mesa:
        query = query.filter_by(id_mesa=id_mesa)
    if id_usuario:
        query = query.filter_by(id_usuario=id_usuario)
    pedidos = query.order_by(Pedido.fecha_creacion.desc()).all()
    return [p.to_dict() for p in pedidos]


@router.get("/{id_pedido}", response_model=PedidoCompletoOut)
def obtener_pedido(id_pedido: int, claims: dict = Depends(get_claims), db: Session = Depends(get_db)):
    pedido = db.get(Pedido, id_pedido)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido.to_dict(with_detalles=True, with_historial=True)


@router.post("", response_model=PedidoConDetallesOut, status_code=201)
def crear_pedido(data: PedidoCreate, claims: dict = Depends(get_claims), db: Session = Depends(get_db)):
    if data.tipo_pedido not in TIPOS_PEDIDO:
        raise HTTPException(
            status_code=400, detail=f"tipo_pedido debe ser uno de: {', '.join(TIPOS_PEDIDO)}"
        )

    # Un pedido de mesa necesita mesa; uno para llevar no ocupa ninguna.
    mesa = None
    if data.tipo_pedido == "mesa":
        if not data.id_mesa:
            raise HTTPException(status_code=400, detail="Un pedido de mesa requiere id_mesa")
        mesa = db.get(Mesa, data.id_mesa)
        if not mesa:
            raise HTTPException(status_code=404, detail="Mesa no encontrada")
        if _tiene_reservacion_proxima(db, mesa.id_mesa):
            raise HTTPException(
                status_code=409,
                detail=(
                    f"La mesa {mesa.numero_mesa} tiene una reservacion en menos de "
                    f"{MINUTOS_BLOQUEO_RESERVACION} minutos. Elige otra mesa o pedido para llevar."
                ),
            )

    id_usuario = claims["id"]
    pedido = Pedido(
        numero_pedido=_generar_numero_pedido(),
        id_mesa=mesa.id_mesa if mesa else None,
        tipo_pedido=data.tipo_pedido,
        id_usuario=id_usuario,
        observaciones=data.observaciones,
        metodo_pago=data.metodo_pago,
    )

    total = 0
    for item in data.detalles:
        producto = db.get(Producto, item.id_producto)
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no encontrado")
        if not producto.disponible:
            raise HTTPException(status_code=409, detail=f"El producto '{producto.nombre}' no esta disponible")

        cantidad = item.cantidad
        subtotal = float(producto.precio) * cantidad
        total += subtotal

        pedido.detalles.append(
            DetallePedido(
                id_producto=producto.id_producto,
                cantidad=cantidad,
                precio_unitario=producto.precio,
                subtotal=subtotal,
                observaciones=item.observaciones,
            )
        )

    pedido.total = total
    if mesa:
        mesa.estado = "ocupada"

    db.add(pedido)
    db.flush()
    db.add(
        PedidoEstadoHistorial(
            id_pedido=pedido.id_pedido, estado_anterior=None, estado_nuevo="pendiente", id_usuario=id_usuario
        )
    )
    # Aviso a caja: hay un nuevo pedido pendiente de validar y mandar a cocina.
    _notificar_rol(
        db,
        rol="cajero",
        tipo="pedido_pendiente",
        mensaje=(
            f"Nuevo pedido {pedido.numero_pedido} ({_describir_origen(pedido, mesa)}) "
            "pendiente de validacion en caja."
        ),
        id_pedido=pedido.id_pedido,
    )
    db.commit()

    return pedido.to_dict(with_detalles=True)


@router.put("/{id_pedido}", response_model=PedidoConDetallesOut)
def actualizar_pedido(
    id_pedido: int, data: PedidoUpdate, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    pedido = db.get(Pedido, id_pedido)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.estado in ESTADOS_BLOQUEADOS_PARA_EDITAR:
        raise HTTPException(
            status_code=409, detail=f"No se puede editar un pedido en estado '{pedido.estado}'"
        )

    cambios = data.model_dump(exclude_unset=True)

    if "observaciones" in cambios:
        pedido.observaciones = cambios["observaciones"]
    if "metodo_pago" in cambios:
        pedido.metodo_pago = cambios["metodo_pago"]

    if data.detalles is not None:
        db.query(DetallePedido).filter_by(id_pedido=pedido.id_pedido).delete()
        total = 0
        for item in data.detalles:
            producto = db.get(Producto, item.id_producto)
            if not producto:
                raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no encontrado")
            if not producto.disponible:
                raise HTTPException(
                    status_code=409, detail=f"El producto '{producto.nombre}' no esta disponible"
                )
            cantidad = item.cantidad
            subtotal = float(producto.precio) * cantidad
            total += subtotal
            db.add(
                DetallePedido(
                    id_pedido=pedido.id_pedido,
                    id_producto=producto.id_producto,
                    cantidad=cantidad,
                    precio_unitario=producto.precio,
                    subtotal=subtotal,
                    observaciones=item.observaciones,
                )
            )
        pedido.total = total

    db.commit()
    db.refresh(pedido)
    return pedido.to_dict(with_detalles=True)


@router.post("/{id_pedido}/inyectar", response_model=PedidoConDetallesOut)
def inyectar_pedido(
    id_pedido: int,
    data: InyeccionIn | None = None,
    claims: dict = Depends(roles_required("admin", "cajero")),
    db: Session = Depends(get_db),
):
    """Paso de validacion de Caja: verifica inventario suficiente, manda la orden a cocina
    (estado en_cocina) y notifica a los cocineros."""
    pedido = db.get(Pedido, id_pedido)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.estado != "pendiente":
        raise HTTPException(
            status_code=409,
            detail=f"Solo se pueden mandar a cocina pedidos en estado 'pendiente' (actual: '{pedido.estado}')",
        )

    faltantes = _faltantes_de_inventario(pedido.detalles)
    if faltantes:
        raise HTTPException(
            status_code=409,
            detail="Inventario insuficiente para preparar el pedido: " + _texto_faltantes(faltantes),
        )

    estado_anterior = pedido.estado
    pedido.estado = "en_cocina"
    pedido.fecha_actualizacion = datetime.now(timezone.utc)

    db.add(
        PedidoEstadoHistorial(
            id_pedido=pedido.id_pedido,
            estado_anterior=estado_anterior,
            estado_nuevo="en_cocina",
            id_usuario=claims["id"],
            comentario=(data.comentario if data else None) or "Validado por caja y mandado a cocina",
        )
    )

    _notificar_rol(
        db,
        rol="cocinero",
        tipo="pedido_nuevo",
        mensaje=(
            f"Pedido {pedido.numero_pedido} ({_describir_origen(pedido)}) "
            "validado por caja: listo para tomar."
        ),
        id_pedido=pedido.id_pedido,
    )

    db.commit()
    return pedido.to_dict(with_detalles=True)


@router.post("/disponibilidad", response_model=DisponibilidadOut)
def revisar_disponibilidad(
    data: DisponibilidadIn, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    """
    Revisa si hay ingredientes suficientes para una lista de productos, antes de que el
    mesero mande el pedido. Es una cortesia, no una reserva: el inventario se descuenta
    hasta que cocina marca el pedido listo, asi que entre medias otro pedido puede
    consumir lo mismo. Sirve para no prometerle al cliente algo que no se puede preparar.
    """
    class _DetalleSimulado:
        def __init__(self, producto, cantidad):
            self.producto = producto
            self.cantidad = cantidad

    detalles = []
    for item in data.detalles:
        producto = db.get(Producto, item.id_producto)
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no encontrado")
        detalles.append(_DetalleSimulado(producto, item.cantidad))

    faltantes = _faltantes_de_inventario(detalles)
    return {"disponible": not faltantes, "faltantes": faltantes}


@router.post("/{id_pedido}/solicitar-cuenta", response_model=PedidoConDetallesOut)
def solicitar_cuenta(
    id_pedido: int,
    claims: dict = Depends(roles_required("admin", "mesero")),
    db: Session = Depends(get_db),
):
    """El mesero avisa que el cliente pidio la cuenta; hasta entonces caja no lo cobra."""
    pedido = db.get(Pedido, id_pedido)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.estado == "cancelado":
        raise HTTPException(status_code=409, detail="Un pedido cancelado no se puede cobrar")

    if any(t.estado == "pagado" for t in pedido.tickets):
        raise HTTPException(status_code=409, detail="Este pedido ya fue cobrado")

    if pedido.cuenta_solicitada:
        raise HTTPException(status_code=409, detail="La cuenta de este pedido ya fue solicitada")

    pedido.cuenta_solicitada = True
    pedido.fecha_cuenta_solicitada = datetime.now(timezone.utc)

    _notificar_rol(
        db,
        rol="cajero",
        tipo="cuenta_solicitada",
        mensaje=(
            f"{_describir_origen(pedido)} pidio la cuenta del pedido {pedido.numero_pedido} "
            f"por ${float(pedido.total or 0):.2f}."
        ),
        id_pedido=pedido.id_pedido,
    )

    db.commit()
    return pedido.to_dict(with_detalles=True)


@router.patch("/{id_pedido}/estado", response_model=PedidoConDetallesOut)
def cambiar_estado_pedido(
    id_pedido: int, data: EstadoPedidoIn, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    pedido = db.get(Pedido, id_pedido)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if data.estado not in ESTADOS_PEDIDO:
        raise HTTPException(
            status_code=400, detail=f"Estado invalido. Debe ser uno de: {', '.join(ESTADOS_PEDIDO)}"
        )

    if pedido.estado in ("entregado", "cancelado"):
        raise HTTPException(
            status_code=409, detail=f"El pedido ya esta '{pedido.estado}' y no puede cambiar de estado"
        )

    # Maquina de estados: solo transiciones validas.
    if data.estado not in TRANSICIONES_VALIDAS.get(pedido.estado, set()):
        permitidas = ", ".join(sorted(TRANSICIONES_VALIDAS.get(pedido.estado, set()))) or "ninguna"
        raise HTTPException(
            status_code=409,
            detail=f"Transicion invalida: de '{pedido.estado}' a '{data.estado}'. Permitidas: {permitidas}",
        )

    # Validacion de roles por transicion.
    rol = claims.get("rol")
    if rol not in ROLES_POR_ESTADO_DESTINO.get(data.estado, set()):
        raise HTTPException(
            status_code=403, detail=f"El rol '{rol}' no puede cambiar un pedido a '{data.estado}'"
        )

    if data.estado == "cancelado":
        if pedido.estado not in CANCELACION_POR_ROL.get(rol, set()):
            raise HTTPException(
                status_code=403,
                detail=f"El rol '{rol}' no puede cancelar un pedido en estado '{pedido.estado}'",
            )
        _validar_ticket_no_pagado(db, pedido)

    id_usuario = claims["id"]
    estado_anterior = pedido.estado
    pedido.estado = data.estado
    pedido.fecha_actualizacion = datetime.now(timezone.utc)

    db.add(
        PedidoEstadoHistorial(
            id_pedido=pedido.id_pedido,
            estado_anterior=estado_anterior,
            estado_nuevo=data.estado,
            id_usuario=id_usuario,
            comentario=data.comentario,
        )
    )

    if data.estado == "listo" and estado_anterior != "listo":
        _descontar_inventario(db, pedido, id_usuario)
        # Solo al mesero que levanto el pedido, no a todos: el es quien pasa por el.
        db.add(
            Notificacion(
                id_pedido=pedido.id_pedido,
                tipo="pedido_listo",
                mensaje=(
                    f"El pedido {pedido.numero_pedido} ({_describir_origen(pedido)}) "
                    "esta listo para entregar."
                ),
                id_receptor=pedido.id_usuario,
            )
        )

    # Cancelacion consistente: si ya se habia descontado inventario (listo), se repone.
    if data.estado == "cancelado" and estado_anterior == "listo":
        _reponer_inventario(db, pedido, id_usuario)

    # Entregar NO libera la mesa: el cliente sigue sentado con su cuenta abierta. La
    # mesa se libera cuando se cobra (ver registrar_pago) o cuando se cancela.
    if data.estado == "cancelado":
        liberar_mesa_si_corresponde(db, pedido)

    db.commit()
    return pedido.to_dict(with_detalles=True)


@router.delete("/{id_pedido}", response_model=MessageOut)
def cancelar_pedido(id_pedido: int, claims: dict = Depends(get_claims), db: Session = Depends(get_db)):
    pedido = db.get(Pedido, id_pedido)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.estado in ("en_preparacion", "listo", "entregado"):
        raise HTTPException(
            status_code=409, detail=f"No se puede cancelar un pedido en estado '{pedido.estado}'"
        )

    rol = claims.get("rol")
    if rol == "mesero" and pedido.id_usuario != claims["id"]:
        raise HTTPException(status_code=403, detail="Un mesero solo puede cancelar sus propios pedidos")
    if rol == "cocinero":
        raise HTTPException(status_code=403, detail="El rol 'cocinero' no puede cancelar pedidos pendientes de caja")

    _validar_ticket_no_pagado(db, pedido)

    id_usuario = claims["id"]
    estado_anterior = pedido.estado
    pedido.estado = "cancelado"

    db.add(
        PedidoEstadoHistorial(
            id_pedido=pedido.id_pedido,
            estado_anterior=estado_anterior,
            estado_nuevo="cancelado",
            id_usuario=id_usuario,
        )
    )

    liberar_mesa_si_corresponde(db, pedido)

    db.commit()
    return {"message": "Pedido cancelado"}


@router.get("/{id_pedido}/historial", response_model=list[HistorialOut])
def historial_pedido(id_pedido: int, claims: dict = Depends(get_claims), db: Session = Depends(get_db)):
    pedido = db.get(Pedido, id_pedido)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return [h.to_dict() for h in pedido.historial]
