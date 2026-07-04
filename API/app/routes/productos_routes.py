from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models.producto import Categoria, Producto
from ..utils.auth import roles_required

productos_bp = Blueprint("productos", __name__)


# --- Categorias ---

@productos_bp.route("/categorias", methods=["GET"])
@jwt_required()
def listar_categorias():
    categorias = Categoria.query.order_by(Categoria.nombre).all()
    return jsonify([c.to_dict() for c in categorias]), 200


@productos_bp.route("/categorias", methods=["POST"])
@roles_required("admin")
def crear_categoria():
    data = request.get_json(silent=True) or {}
    if not data.get("nombre"):
        return jsonify({"error": "nombre es requerido"}), 400

    categoria = Categoria(
        nombre=data["nombre"],
        descripcion=data.get("descripcion"),
        activo=data.get("activo", True),
    )
    db.session.add(categoria)
    db.session.commit()
    return jsonify(categoria.to_dict()), 201


@productos_bp.route("/categorias/<int:id_categoria>", methods=["PUT"])
@roles_required("admin")
def actualizar_categoria(id_categoria):
    categoria = db.session.get(Categoria, id_categoria)
    if not categoria:
        return jsonify({"error": "Categoria no encontrada"}), 404

    data = request.get_json(silent=True) or {}
    for campo in ("nombre", "descripcion", "activo"):
        if campo in data:
            setattr(categoria, campo, data[campo])

    db.session.commit()
    return jsonify(categoria.to_dict()), 200


@productos_bp.route("/categorias/<int:id_categoria>", methods=["DELETE"])
@roles_required("admin")
def eliminar_categoria(id_categoria):
    categoria = db.session.get(Categoria, id_categoria)
    if not categoria:
        return jsonify({"error": "Categoria no encontrada"}), 404

    db.session.delete(categoria)
    db.session.commit()
    return jsonify({"message": "Categoria eliminada"}), 200


# --- Productos ---

@productos_bp.route("/productos", methods=["GET"])
@jwt_required()
def listar_productos():
    id_categoria = request.args.get("id_categoria", type=int)
    disponible = request.args.get("disponible")
    query = Producto.query
    if id_categoria:
        query = query.filter_by(id_categoria=id_categoria)
    if disponible is not None:
        query = query.filter_by(disponible=disponible.lower() in ("1", "true", "si"))
    productos = query.order_by(Producto.nombre).all()
    return jsonify([p.to_dict() for p in productos]), 200


@productos_bp.route("/productos/<int:id_producto>", methods=["GET"])
@jwt_required()
def obtener_producto(id_producto):
    producto = db.session.get(Producto, id_producto)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify(producto.to_dict()), 200


@productos_bp.route("/productos", methods=["POST"])
@roles_required("admin")
def crear_producto():
    data = request.get_json(silent=True) or {}
    if not data.get("nombre") or data.get("precio") is None:
        return jsonify({"error": "nombre y precio son requeridos"}), 400

    producto = Producto(
        nombre=data["nombre"],
        descripcion=data.get("descripcion"),
        precio=data["precio"],
        imagen=data.get("imagen"),
        disponible=data.get("disponible", True),
        id_categoria=data.get("id_categoria"),
    )
    db.session.add(producto)
    db.session.commit()
    return jsonify(producto.to_dict()), 201


@productos_bp.route("/productos/<int:id_producto>", methods=["PUT"])
@roles_required("admin")
def actualizar_producto(id_producto):
    producto = db.session.get(Producto, id_producto)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    for campo in ("nombre", "descripcion", "precio", "imagen", "disponible", "id_categoria"):
        if campo in data:
            setattr(producto, campo, data[campo])

    db.session.commit()
    return jsonify(producto.to_dict()), 200


@productos_bp.route("/productos/<int:id_producto>", methods=["DELETE"])
@roles_required("admin")
def eliminar_producto(id_producto):
    producto = db.session.get(Producto, id_producto)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    db.session.delete(producto)
    db.session.commit()
    return jsonify({"message": "Producto eliminado"}), 200
