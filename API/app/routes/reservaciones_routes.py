from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models.reservacion import Reservacion
from ..models.mesa import Mesa

import datetime

reservaciones_bp = Blueprint("reservaciones", __name__)


def check_expired_reservations():
    tz_gmt6 = datetime.timezone(datetime.timedelta(hours=-6))
    now_gmt6 = datetime.datetime.now(tz_gmt6)
    
    reservaciones = Reservacion.query.all()
    expired_detected = False
    for res in reservaciones:
        try:
            # Parse YYYY/MM/DD HH:MM
            res_dt = datetime.datetime.strptime(f"{res.fecha} {res.hora}", "%Y/%m/%d %H:%M")
            res_dt = res_dt.replace(tzinfo=tz_gmt6)
            
            if now_gmt6 > (res_dt + datetime.timedelta(minutes=5)):
                if res.mesa and res.mesa.estado == "reservada":
                    res.mesa.estado = "disponible"
                db.session.delete(res)
                expired_detected = True
        except Exception as e:
            print("Error checking reservation expiration:", e)
    if expired_detected:
        db.session.commit()


@reservaciones_bp.route("", methods=["GET"])
@jwt_required()
def listar_reservaciones():
    check_expired_reservations()
    reservaciones = Reservacion.query.order_by(Reservacion.fecha.desc()).all()
    return jsonify([r.to_dict() for r in reservaciones]), 200


@reservaciones_bp.route("", methods=["POST"])
@jwt_required()
def crear_reservacion():
    data = request.get_json(silent=True) or {}
    requeridos = ("nombre_cliente", "telefono", "id_mesa", "fecha", "hora")
    if any(data.get(campo) is None for campo in requeridos):
        return jsonify({"error": f"Campos requeridos: {', '.join(requeridos)}"}), 400

    id_mesa = data["id_mesa"]
    mesa = db.session.get(Mesa, id_mesa)
    if not mesa:
        return jsonify({"error": "Mesa no encontrada"}), 404

    reservacion = Reservacion(
        nombre_cliente=data["nombre_cliente"],
        telefono=data["telefono"],
        id_mesa=id_mesa,
        fecha=data["fecha"],
        hora=data["hora"],
    )
    mesa.estado = "reservada"
    db.session.add(reservacion)
    db.session.commit()
    return jsonify(reservacion.to_dict()), 201
