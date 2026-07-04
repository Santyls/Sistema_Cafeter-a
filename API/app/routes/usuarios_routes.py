from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models.usuario import ROLES_VALIDOS, Usuario
from ..utils.auth import roles_required

usuarios_bp = Blueprint("usuarios", __name__)


@usuarios_bp.route("", methods=["GET"])
@roles_required("admin")
def listar_usuarios():
    rol = request.args.get("rol")
    query = Usuario.query
    if rol:
        query = query.filter_by(rol=rol)
    usuarios = query.order_by(Usuario.nombre).all()
    return jsonify([u.to_dict() for u in usuarios]), 200


@usuarios_bp.route("/<int:id_usuario>", methods=["GET"])
@roles_required("admin")
def obtener_usuario(id_usuario):
    user = db.session.get(Usuario, id_usuario)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user.to_dict()), 200


@usuarios_bp.route("", methods=["POST"])
@roles_required("admin")
def crear_usuario():
    data = request.get_json(silent=True) or {}
    requeridos = ("nombre", "correo", "usuario", "contrasena", "rol")
    faltantes = [campo for campo in requeridos if not data.get(campo)]
    if faltantes:
        return jsonify({"error": f"Campos requeridos faltantes: {', '.join(faltantes)}"}), 400

    if data["rol"] not in ROLES_VALIDOS:
        return jsonify({"error": f"Rol invalido. Debe ser uno de: {', '.join(ROLES_VALIDOS)}"}), 400

    if Usuario.query.filter_by(correo=data["correo"]).first():
        return jsonify({"error": "El correo ya esta registrado"}), 409
    if Usuario.query.filter_by(usuario=data["usuario"]).first():
        return jsonify({"error": "El nombre de usuario ya esta en uso"}), 409

    user = Usuario(
        nombre=data["nombre"],
        apellido_paterno=data.get("apellido_paterno"),
        apellido_materno=data.get("apellido_materno"),
        telefono=data.get("telefono"),
        correo=data["correo"],
        usuario=data["usuario"],
        rol=data["rol"],
    )
    user.set_password(data["contrasena"])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@usuarios_bp.route("/<int:id_usuario>", methods=["PUT"])
@roles_required("admin")
def actualizar_usuario(id_usuario):
    user = db.session.get(Usuario, id_usuario)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json(silent=True) or {}

    if "rol" in data and data["rol"] not in ROLES_VALIDOS:
        return jsonify({"error": f"Rol invalido. Debe ser uno de: {', '.join(ROLES_VALIDOS)}"}), 400

    for campo in ("nombre", "apellido_paterno", "apellido_materno", "telefono", "correo", "usuario", "rol", "activo"):
        if campo in data:
            setattr(user, campo, data[campo])

    if data.get("contrasena"):
        user.set_password(data["contrasena"])

    db.session.commit()
    return jsonify(user.to_dict()), 200


@usuarios_bp.route("/<int:id_usuario>", methods=["DELETE"])
@roles_required("admin")
def eliminar_usuario(id_usuario):
    if id_usuario == int(get_jwt_identity()):
        return jsonify({"error": "Un administrador no puede eliminarse a si mismo"}), 400

    user = db.session.get(Usuario, id_usuario)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Usuario eliminado"}), 200
