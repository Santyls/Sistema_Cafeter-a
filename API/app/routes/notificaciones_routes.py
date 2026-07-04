from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models.notificacion import Notificacion

notificaciones_bp = Blueprint("notificaciones", __name__)


@notificaciones_bp.route("", methods=["GET"])
@jwt_required()
def listar_notificaciones():
    id_receptor = request.args.get("id_receptor", type=int) or int(get_jwt_identity())
    estado = request.args.get("estado")
    query = Notificacion.query.filter_by(id_receptor=id_receptor)
    if estado:
        query = query.filter_by(estado=estado)
    notificaciones = query.order_by(Notificacion.fecha_envio.desc()).all()
    return jsonify([n.to_dict() for n in notificaciones]), 200


@notificaciones_bp.route("", methods=["POST"])
@jwt_required()
def crear_notificacion():
    data = request.get_json(silent=True) or {}
    requeridos = ("tipo", "mensaje", "id_receptor")
    if any(not data.get(campo) for campo in requeridos):
        return jsonify({"error": f"Campos requeridos: {', '.join(requeridos)}"}), 400

    notificacion = Notificacion(
        id_pedido=data.get("id_pedido"),
        tipo=data["tipo"],
        mensaje=data["mensaje"],
        id_receptor=data["id_receptor"],
    )
    db.session.add(notificacion)
    db.session.commit()
    return jsonify(notificacion.to_dict()), 201


@notificaciones_bp.route("/<int:id_notificacion>/leida", methods=["PATCH"])
@jwt_required()
def marcar_leida(id_notificacion):
    notificacion = db.session.get(Notificacion, id_notificacion)
    if not notificacion:
        return jsonify({"error": "Notificacion no encontrada"}), 404

    notificacion.estado = "leida"
    notificacion.fecha_lectura = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(notificacion.to_dict()), 200
