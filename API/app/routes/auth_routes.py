from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from ..extensions import db
from ..models.usuario import Usuario

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    identificador = data.get("usuario") or data.get("correo")
    contrasena = data.get("contrasena")

    if not identificador or not contrasena:
        return jsonify({"error": "usuario/correo y contrasena son requeridos"}), 400

    user = Usuario.query.filter(
        (Usuario.usuario == identificador) | (Usuario.correo == identificador)
    ).first()

    if not user or not user.activo or not user.check_password(contrasena):
        return jsonify({"error": "Credenciales invalidas"}), 401

    token = create_access_token(identity=str(user.id_usuario), additional_claims={"rol": user.rol})
    return jsonify({"access_token": token, "usuario": user.to_dict()}), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return jsonify({"message": "Sesion cerrada"}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = db.session.get(Usuario, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user.to_dict()), 200


@auth_bp.route("/recuperar-password", methods=["POST"])
def recuperar_password():
    data = request.get_json(silent=True) or {}
    correo = data.get("correo")
    if not correo:
        return jsonify({"error": "correo es requerido"}), 400
    # No se revela si el correo existe o no, por seguridad.
    return jsonify({"message": "Si el correo existe, se enviaran instrucciones de recuperacion"}), 200
