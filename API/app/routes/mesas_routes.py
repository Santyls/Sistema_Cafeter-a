from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models.mesa import ESTADOS_MESA, Mesa
from ..utils.auth import roles_required

mesas_bp = Blueprint("mesas", __name__)


@mesas_bp.route("", methods=["GET"])
@jwt_required()
def listar_mesas():
    estado = request.args.get("estado")
    query = Mesa.query
    if estado:
        query = query.filter_by(estado=estado)
    mesas = query.order_by(Mesa.numero_mesa).all()
    return jsonify([m.to_dict() for m in mesas]), 200


@mesas_bp.route("/<int:id_mesa>", methods=["GET"])
@jwt_required()
def obtener_mesa(id_mesa):
    mesa = db.session.get(Mesa, id_mesa)
    if not mesa:
        return jsonify({"error": "Mesa no encontrada"}), 404
    return jsonify(mesa.to_dict()), 200


@mesas_bp.route("", methods=["POST"])
@roles_required("admin")
def crear_mesa():
    data = request.get_json(silent=True) or {}
    if not data.get("numero_mesa"):
        return jsonify({"error": "numero_mesa es requerido"}), 400

    mesa = Mesa(
        numero_mesa=data["numero_mesa"],
        capacidad=data.get("capacidad", 4),
        ubicacion=data.get("ubicacion"),
        estado=data.get("estado", "disponible"),
    )
    db.session.add(mesa)
    db.session.commit()
    return jsonify(mesa.to_dict()), 201


@mesas_bp.route("/<int:id_mesa>", methods=["PUT"])
@roles_required("admin")
def actualizar_mesa(id_mesa):
    mesa = db.session.get(Mesa, id_mesa)
    if not mesa:
        return jsonify({"error": "Mesa no encontrada"}), 404

    data = request.get_json(silent=True) or {}
    for campo in ("numero_mesa", "capacidad", "ubicacion", "estado"):
        if campo in data:
            setattr(mesa, campo, data[campo])

    db.session.commit()
    return jsonify(mesa.to_dict()), 200


@mesas_bp.route("/<int:id_mesa>/estado", methods=["PATCH"])
@jwt_required()
def cambiar_estado_mesa(id_mesa):
    mesa = db.session.get(Mesa, id_mesa)
    if not mesa:
        return jsonify({"error": "Mesa no encontrada"}), 404

    data = request.get_json(silent=True) or {}
    estado = data.get("estado")
    if estado not in ESTADOS_MESA:
        return jsonify({"error": f"Estado invalido. Debe ser uno de: {', '.join(ESTADOS_MESA)}"}), 400

    mesa.estado = estado
    db.session.commit()
    return jsonify(mesa.to_dict()), 200


@mesas_bp.route("/<int:id_mesa>", methods=["DELETE"])
@roles_required("admin")
def eliminar_mesa(id_mesa):
    mesa = db.session.get(Mesa, id_mesa)
    if not mesa:
        return jsonify({"error": "Mesa no encontrada"}), 404

    db.session.delete(mesa)
    db.session.commit()
    return jsonify({"message": "Mesa eliminada"}), 200
