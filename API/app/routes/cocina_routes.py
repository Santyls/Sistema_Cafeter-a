from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models.ingrediente import Ingrediente, Receta
from ..models.inventario import TIPOS_MOVIMIENTO, AlertaStock, InventarioMovimiento
from ..utils.auth import roles_required

cocina_bp = Blueprint("cocina", __name__)


# --- Ingredientes ---

@cocina_bp.route("/ingredientes", methods=["GET"])
@jwt_required()
def listar_ingredientes():
    stock_bajo = request.args.get("stock_bajo")
    ingredientes = Ingrediente.query.order_by(Ingrediente.nombre).all()
    if stock_bajo and stock_bajo.lower() in ("1", "true", "si"):
        ingredientes = [i for i in ingredientes if float(i.stock_actual) < float(i.stock_minimo)]
    return jsonify([i.to_dict() for i in ingredientes]), 200


@cocina_bp.route("/ingredientes/<int:id_ingrediente>", methods=["GET"])
@jwt_required()
def obtener_ingrediente(id_ingrediente):
    ingrediente = db.session.get(Ingrediente, id_ingrediente)
    if not ingrediente:
        return jsonify({"error": "Ingrediente no encontrado"}), 404
    return jsonify(ingrediente.to_dict()), 200


@cocina_bp.route("/ingredientes", methods=["POST"])
@roles_required("admin", "cocinero")
def crear_ingrediente():
    data = request.get_json(silent=True) or {}
    if not data.get("nombre") or not data.get("unidad_medida"):
        return jsonify({"error": "nombre y unidad_medida son requeridos"}), 400

    ingrediente = Ingrediente(
        nombre=data["nombre"],
        unidad_medida=data["unidad_medida"],
        stock_actual=data.get("stock_actual", 0),
        stock_minimo=data.get("stock_minimo", 0),
        activo=data.get("activo", True),
    )
    db.session.add(ingrediente)
    db.session.commit()
    return jsonify(ingrediente.to_dict()), 201


@cocina_bp.route("/ingredientes/<int:id_ingrediente>", methods=["PUT"])
@roles_required("admin", "cocinero")
def actualizar_ingrediente(id_ingrediente):
    ingrediente = db.session.get(Ingrediente, id_ingrediente)
    if not ingrediente:
        return jsonify({"error": "Ingrediente no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    for campo in ("nombre", "unidad_medida", "stock_actual", "stock_minimo", "activo"):
        if campo in data:
            setattr(ingrediente, campo, data[campo])

    db.session.commit()
    return jsonify(ingrediente.to_dict()), 200


@cocina_bp.route("/ingredientes/<int:id_ingrediente>", methods=["DELETE"])
@roles_required("admin", "cocinero")
def eliminar_ingrediente(id_ingrediente):
    ingrediente = db.session.get(Ingrediente, id_ingrediente)
    if not ingrediente:
        return jsonify({"error": "Ingrediente no encontrado"}), 404

    db.session.delete(ingrediente)
    db.session.commit()
    return jsonify({"message": "Ingrediente eliminado"}), 200


# --- Recetas ---

@cocina_bp.route("/recetas", methods=["GET"])
@jwt_required()
def listar_recetas():
    id_producto = request.args.get("id_producto", type=int)
    query = Receta.query
    if id_producto:
        query = query.filter_by(id_producto=id_producto)
    return jsonify([r.to_dict() for r in query.all()]), 200


@cocina_bp.route("/recetas", methods=["POST"])
@roles_required("admin", "cocinero")
def crear_receta():
    data = request.get_json(silent=True) or {}
    requeridos = ("id_producto", "id_ingrediente", "cantidad_requerida")
    if any(data.get(campo) is None for campo in requeridos):
        return jsonify({"error": f"Campos requeridos: {', '.join(requeridos)}"}), 400

    receta = Receta(
        id_producto=data["id_producto"],
        id_ingrediente=data["id_ingrediente"],
        cantidad_requerida=data["cantidad_requerida"],
    )
    db.session.add(receta)
    db.session.commit()
    return jsonify(receta.to_dict()), 201


@cocina_bp.route("/recetas/<int:id_receta>", methods=["DELETE"])
@roles_required("admin", "cocinero")
def eliminar_receta(id_receta):
    receta = db.session.get(Receta, id_receta)
    if not receta:
        return jsonify({"error": "Receta no encontrada"}), 404

    db.session.delete(receta)
    db.session.commit()
    return jsonify({"message": "Receta eliminada"}), 200


# --- Movimientos de inventario ---

@cocina_bp.route("/inventario-movimientos", methods=["GET"])
@jwt_required()
def listar_movimientos():
    id_ingrediente = request.args.get("id_ingrediente", type=int)
    query = InventarioMovimiento.query
    if id_ingrediente:
        query = query.filter_by(id_ingrediente=id_ingrediente)
    movimientos = query.order_by(InventarioMovimiento.fecha_movimiento.desc()).all()
    return jsonify([m.to_dict() for m in movimientos]), 200


@cocina_bp.route("/inventario-movimientos", methods=["POST"])
@roles_required("admin", "cocinero")
def crear_movimiento():
    data = request.get_json(silent=True) or {}
    requeridos = ("id_ingrediente", "tipo_movimiento", "cantidad")
    if any(data.get(campo) is None for campo in requeridos):
        return jsonify({"error": f"Campos requeridos: {', '.join(requeridos)}"}), 400

    if data["tipo_movimiento"] not in TIPOS_MOVIMIENTO:
        return jsonify({"error": f"tipo_movimiento debe ser uno de: {', '.join(TIPOS_MOVIMIENTO)}"}), 400

    ingrediente = db.session.get(Ingrediente, data["id_ingrediente"])
    if not ingrediente:
        return jsonify({"error": "Ingrediente no encontrado"}), 404

    stock_anterior = float(ingrediente.stock_actual)
    cantidad = float(data["cantidad"])

    if data["tipo_movimiento"] == "entrada":
        stock_nuevo = stock_anterior + cantidad
    elif data["tipo_movimiento"] == "salida":
        stock_nuevo = stock_anterior - cantidad
    else:  # ajuste: la cantidad representa el nuevo stock absoluto
        stock_nuevo = cantidad

    ingrediente.stock_actual = stock_nuevo

    movimiento = InventarioMovimiento(
        id_ingrediente=ingrediente.id_ingrediente,
        tipo_movimiento=data["tipo_movimiento"],
        cantidad=cantidad,
        stock_anterior=stock_anterior,
        stock_nuevo=stock_nuevo,
        id_usuario=int(get_jwt_identity()),
        referencia=data.get("referencia"),
        observaciones=data.get("observaciones"),
    )
    db.session.add(movimiento)

    if stock_nuevo < float(ingrediente.stock_minimo):
        db.session.add(
            AlertaStock(
                id_ingrediente=ingrediente.id_ingrediente,
                stock_actual=stock_nuevo,
                stock_minimo=ingrediente.stock_minimo,
            )
        )

    db.session.commit()
    return jsonify(movimiento.to_dict()), 201


# --- Alertas de stock ---

@cocina_bp.route("/alertas-stock", methods=["GET"])
@jwt_required()
def listar_alertas():
    atendida = request.args.get("atendida")
    query = AlertaStock.query
    if atendida is not None:
        query = query.filter_by(atendida=atendida.lower() in ("1", "true", "si"))
    alertas = query.order_by(AlertaStock.fecha_alerta.desc()).all()
    return jsonify([a.to_dict() for a in alertas]), 200


@cocina_bp.route("/alertas-stock/<int:id_alerta>/atender", methods=["PATCH"])
@roles_required("admin", "cocinero")
def atender_alerta(id_alerta):
    from datetime import datetime, timezone

    alerta = db.session.get(AlertaStock, id_alerta)
    if not alerta:
        return jsonify({"error": "Alerta no encontrada"}), 404

    alerta.atendida = True
    alerta.fecha_atendida = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(alerta.to_dict()), 200
