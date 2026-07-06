import uuid
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models.inventario import AlertaStock, InventarioMovimiento
from ..models.mesa import Mesa
from ..models.notificacion import Notificacion
from ..models.pedido import ESTADOS_PEDIDO, DetallePedido, Pedido, PedidoEstadoHistorial
from ..models.producto import Producto

pedidos_bp = Blueprint("pedidos", __name__)

ESTADOS_BLOQUEADOS_PARA_EDITAR = ("listo", "entregado", "cancelado")


def _generar_numero_pedido():
    return f"PED-{uuid.uuid4().hex[:8].upper()}"


def _descontar_inventario(pedido, id_usuario):
    """Descuenta ingredientes segun receta de cada producto del pedido y genera alertas de stock bajo."""
    for detalle in pedido.detalles:
        for receta in detalle.producto.recetas:
            ingrediente = receta.ingrediente
            stock_anterior = ingrediente.stock_actual
            cantidad_usada = receta.cantidad_requerida * detalle.cantidad
            ingrediente.stock_actual = float(stock_anterior) - float(cantidad_usada)

            db.session.add(
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
                db.session.add(
                    AlertaStock(
                        id_ingrediente=ingrediente.id_ingrediente,
                        stock_actual=ingrediente.stock_actual,
                        stock_minimo=ingrediente.stock_minimo,
                    )
                )


@pedidos_bp.route("", methods=["GET"])
@jwt_required()
def listar_pedidos():
    estado = request.args.get("estado")
    id_mesa = request.args.get("id_mesa", type=int)
    id_usuario = request.args.get("id_usuario", type=int)
    query = Pedido.query
    if estado:
        query = query.filter_by(estado=estado)
    if id_mesa:
        query = query.filter_by(id_mesa=id_mesa)
    if id_usuario:
        query = query.filter_by(id_usuario=id_usuario)
    pedidos = query.order_by(Pedido.fecha_creacion.desc()).all()
    return jsonify([p.to_dict() for p in pedidos]), 200


@pedidos_bp.route("/<int:id_pedido>", methods=["GET"])
@jwt_required()
def obtener_pedido(id_pedido):
    pedido = db.session.get(Pedido, id_pedido)
    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404
    return jsonify(pedido.to_dict(with_detalles=True, with_historial=True)), 200


@pedidos_bp.route("", methods=["POST"])
@jwt_required()
def crear_pedido():
    data = request.get_json(silent=True) or {}
    id_mesa = data.get("id_mesa")
    items = data.get("detalles") or []

    if not id_mesa or not items:
        return jsonify({"error": "id_mesa y detalles (lista de productos) son requeridos"}), 400

    mesa = db.session.get(Mesa, id_mesa)
    if not mesa:
        return jsonify({"error": "Mesa no encontrada"}), 404

    id_usuario = int(get_jwt_identity())
    pedido = Pedido(
        numero_pedido=_generar_numero_pedido(),
        id_mesa=id_mesa,
        id_usuario=id_usuario,
        observaciones=data.get("observaciones"),
        metodo_pago=data.get("metodo_pago"),
    )

    total = 0
    for item in items:
        producto = db.session.get(Producto, item.get("id_producto"))
        if not producto:
            return jsonify({"error": f"Producto {item.get('id_producto')} no encontrado"}), 404
        if not producto.disponible:
            return jsonify({"error": f"El producto '{producto.nombre}' no esta disponible"}), 409

        cantidad = int(item.get("cantidad", 1))
        subtotal = float(producto.precio) * cantidad
        total += subtotal

        pedido.detalles.append(
            DetallePedido(
                id_producto=producto.id_producto,
                cantidad=cantidad,
                precio_unitario=producto.precio,
                subtotal=subtotal,
                observaciones=item.get("observaciones"),
            )
        )

    pedido.total = total
    mesa.estado = "ocupada"

    db.session.add(pedido)
    db.session.add(
        PedidoEstadoHistorial(
            pedido=pedido, estado_anterior=None, estado_nuevo="pendiente", id_usuario=id_usuario
        )
    )
    db.session.commit()

    return jsonify(pedido.to_dict(with_detalles=True)), 201


@pedidos_bp.route("/<int:id_pedido>", methods=["PUT"])
@jwt_required()
def actualizar_pedido(id_pedido):
    pedido = db.session.get(Pedido, id_pedido)
    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404

    if pedido.estado in ESTADOS_BLOQUEADOS_PARA_EDITAR:
        return jsonify({"error": f"No se puede editar un pedido en estado '{pedido.estado}'"}), 409

    data = request.get_json(silent=True) or {}

    if "observaciones" in data:
        pedido.observaciones = data["observaciones"]
    if "metodo_pago" in data:
        pedido.metodo_pago = data["metodo_pago"]

    if "detalles" in data:
        DetallePedido.query.filter_by(id_pedido=pedido.id_pedido).delete()
        total = 0
        for item in data["detalles"]:
            producto = db.session.get(Producto, item.get("id_producto"))
            if not producto:
                return jsonify({"error": f"Producto {item.get('id_producto')} no encontrado"}), 404
            if not producto.disponible:
                return jsonify({"error": f"El producto '{producto.nombre}' no esta disponible"}), 409
            cantidad = int(item.get("cantidad", 1))
            subtotal = float(producto.precio) * cantidad
            total += subtotal
            db.session.add(
                DetallePedido(
                    id_pedido=pedido.id_pedido,
                    id_producto=producto.id_producto,
                    cantidad=cantidad,
                    precio_unitario=producto.precio,
                    subtotal=subtotal,
                    observaciones=item.get("observaciones"),
                )
            )
        pedido.total = total

    db.session.commit()
    return jsonify(pedido.to_dict(with_detalles=True)), 200


@pedidos_bp.route("/<int:id_pedido>/estado", methods=["PATCH"])
@jwt_required()
def cambiar_estado_pedido(id_pedido):
    pedido = db.session.get(Pedido, id_pedido)
    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    nuevo_estado = data.get("estado")
    if nuevo_estado not in ESTADOS_PEDIDO:
        return jsonify({"error": f"Estado invalido. Debe ser uno de: {', '.join(ESTADOS_PEDIDO)}"}), 400

    if pedido.estado in ("entregado", "cancelado"):
        return jsonify({"error": f"El pedido ya esta '{pedido.estado}' y no puede cambiar de estado"}), 409

    id_usuario = int(get_jwt_identity())
    estado_anterior = pedido.estado
    pedido.estado = nuevo_estado
    pedido.fecha_actualizacion = datetime.now(timezone.utc)

    db.session.add(
        PedidoEstadoHistorial(
            id_pedido=pedido.id_pedido,
            estado_anterior=estado_anterior,
            estado_nuevo=nuevo_estado,
            id_usuario=id_usuario,
            comentario=data.get("comentario"),
        )
    )

    if nuevo_estado == "listo" and estado_anterior != "listo":
        _descontar_inventario(pedido, id_usuario)
        # Notifica al mesero que levanto el pedido que ya esta listo para entregar.
        db.session.add(
            Notificacion(
                id_pedido=pedido.id_pedido,
                tipo="pedido_listo",
                mensaje=f"El pedido {pedido.numero_pedido} esta listo para entregar.",
                id_receptor=pedido.id_usuario,
            )
        )

    if nuevo_estado in ("entregado", "cancelado"):
        mesa = db.session.get(Mesa, pedido.id_mesa)
        if mesa:
            mesa.estado = "disponible"

    db.session.commit()
    return jsonify(pedido.to_dict(with_detalles=True)), 200


@pedidos_bp.route("/<int:id_pedido>", methods=["DELETE"])
@jwt_required()
def cancelar_pedido(id_pedido):
    pedido = db.session.get(Pedido, id_pedido)
    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404

    if pedido.estado in ("en_preparacion", "listo", "entregado"):
        return jsonify({"error": f"No se puede cancelar un pedido en estado '{pedido.estado}'"}), 409

    id_usuario = int(get_jwt_identity())
    estado_anterior = pedido.estado
    pedido.estado = "cancelado"

    db.session.add(
        PedidoEstadoHistorial(
            id_pedido=pedido.id_pedido,
            estado_anterior=estado_anterior,
            estado_nuevo="cancelado",
            id_usuario=id_usuario,
        )
    )

    mesa = db.session.get(Mesa, pedido.id_mesa)
    if mesa:
        mesa.estado = "disponible"

    db.session.commit()
    return jsonify({"message": "Pedido cancelado"}), 200


@pedidos_bp.route("/<int:id_pedido>/historial", methods=["GET"])
@jwt_required()
def historial_pedido(id_pedido):
    pedido = db.session.get(Pedido, id_pedido)
    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404
    return jsonify([h.to_dict() for h in pedido.historial]), 200
