import uuid
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models.caja import Caja, CompraSuministro, CorteCaja, Gasto, Pago, Ticket
from ..utils.auth import roles_required

caja_bp = Blueprint("caja", __name__)


def _generar_folio():
    return f"TCK-{uuid.uuid4().hex[:8].upper()}"


# --- Turnos de caja ---

@caja_bp.route("/caja", methods=["GET"])
@roles_required("admin", "cajero")
def listar_cajas():
    estado = request.args.get("estado")
    query = Caja.query
    if estado:
        query = query.filter_by(estado=estado)
    return jsonify([c.to_dict() for c in query.order_by(Caja.fecha_apertura.desc()).all()]), 200


@caja_bp.route("/caja/<int:id_caja>", methods=["GET"])
@roles_required("admin", "cajero")
def obtener_caja(id_caja):
    caja = db.session.get(Caja, id_caja)
    if not caja:
        return jsonify({"error": "Caja no encontrada"}), 404
    return jsonify(caja.to_dict()), 200


@caja_bp.route("/caja", methods=["POST"])
@roles_required("admin", "cajero")
def abrir_caja():
    data = request.get_json(silent=True) or {}
    caja = Caja(
        id_usuario=int(get_jwt_identity()),
        fondo_inicial=data.get("fondo_inicial", 0),
        observaciones=data.get("observaciones"),
    )
    db.session.add(caja)
    db.session.commit()
    return jsonify(caja.to_dict()), 201


@caja_bp.route("/caja/<int:id_caja>/cerrar", methods=["PATCH"])
@roles_required("admin", "cajero")
def cerrar_caja(id_caja):
    caja = db.session.get(Caja, id_caja)
    if not caja:
        return jsonify({"error": "Caja no encontrada"}), 404
    if caja.estado == "cerrado":
        return jsonify({"error": "Esta caja ya esta cerrada"}), 409

    caja.estado = "cerrado"
    caja.fecha_cierre = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(caja.to_dict()), 200


# --- Tickets ---

@caja_bp.route("/tickets", methods=["GET"])
@roles_required("admin", "cajero")
def listar_tickets():
    estado = request.args.get("estado")
    id_caja = request.args.get("id_caja", type=int)
    query = Ticket.query
    if estado:
        query = query.filter_by(estado=estado)
    if id_caja:
        query = query.filter_by(id_caja=id_caja)
    return jsonify([t.to_dict() for t in query.order_by(Ticket.fecha.desc()).all()]), 200


@caja_bp.route("/tickets/<int:id_ticket>", methods=["GET"])
@roles_required("admin", "cajero")
def obtener_ticket(id_ticket):
    ticket = db.session.get(Ticket, id_ticket)
    if not ticket:
        return jsonify({"error": "Ticket no encontrado"}), 404
    return jsonify(ticket.to_dict(with_pagos=True)), 200


@caja_bp.route("/tickets", methods=["POST"])
@roles_required("admin", "cajero")
def crear_ticket():
    data = request.get_json(silent=True) or {}
    requeridos = ("id_caja", "total")
    if any(data.get(campo) is None for campo in requeridos):
        return jsonify({"error": f"Campos requeridos: {', '.join(requeridos)}"}), 400

    caja = db.session.get(Caja, data["id_caja"])
    if not caja or caja.estado != "abierto":
        return jsonify({"error": "La caja indicada no existe o no esta abierta"}), 400

    ticket = Ticket(
        folio=_generar_folio(),
        id_pedido=data.get("id_pedido"),
        id_caja=data["id_caja"],
        id_usuario=int(get_jwt_identity()),
        total=data["total"],
        impuesto=data.get("impuesto", 0),
        descuento=data.get("descuento", 0),
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify(ticket.to_dict()), 201


# --- Pagos ---

@caja_bp.route("/pagos", methods=["POST"])
@roles_required("admin", "cajero")
def registrar_pago():
    data = request.get_json(silent=True) or {}
    requeridos = ("id_ticket", "monto", "tipo_pago")
    if any(data.get(campo) is None for campo in requeridos):
        return jsonify({"error": f"Campos requeridos: {', '.join(requeridos)}"}), 400

    ticket = db.session.get(Ticket, data["id_ticket"])
    if not ticket:
        return jsonify({"error": "Ticket no encontrado"}), 404
    if ticket.estado == "pagado":
        return jsonify({"error": "Este ticket ya fue pagado"}), 409

    pago = Pago(
        id_ticket=ticket.id_ticket,
        monto=data["monto"],
        tipo_pago=data["tipo_pago"],
        referencia=data.get("referencia"),
        cambio=data.get("cambio", 0),
    )
    db.session.add(pago)

    total_pagado = sum(float(p.monto) for p in ticket.pagos) + float(data["monto"])
    if total_pagado >= float(ticket.total):
        ticket.estado = "pagado"

    db.session.commit()
    return jsonify(pago.to_dict()), 201


# --- Cortes de caja ---

@caja_bp.route("/cortes-caja", methods=["GET"])
@roles_required("admin", "cajero")
def listar_cortes():
    return jsonify([c.to_dict() for c in CorteCaja.query.order_by(CorteCaja.fecha_corte.desc()).all()]), 200


@caja_bp.route("/cortes-caja", methods=["POST"])
@roles_required("admin", "cajero")
def crear_corte():
    data = request.get_json(silent=True) or {}
    if not data.get("id_caja"):
        return jsonify({"error": "id_caja es requerido"}), 400

    caja = db.session.get(Caja, data["id_caja"])
    if not caja:
        return jsonify({"error": "Caja no encontrada"}), 404

    tickets_pagados = [t for t in Ticket.query.filter_by(id_caja=caja.id_caja, estado="pagado").all()]
    total_efectivo = total_tarjeta = total_transferencia = 0.0
    for ticket in tickets_pagados:
        for pago in ticket.pagos:
            if pago.tipo_pago == "efectivo":
                total_efectivo += float(pago.monto)
            elif pago.tipo_pago == "tarjeta":
                total_tarjeta += float(pago.monto)
            elif pago.tipo_pago == "transferencia":
                total_transferencia += float(pago.monto)

    total_ventas = total_efectivo + total_tarjeta + total_transferencia

    corte = CorteCaja(
        id_caja=caja.id_caja,
        id_usuario=int(get_jwt_identity()),
        total_ventas=total_ventas,
        total_efectivo=total_efectivo,
        total_tarjeta=total_tarjeta,
        total_transferencia=total_transferencia,
        diferencia=data.get("diferencia", 0),
    )
    db.session.add(corte)
    db.session.commit()
    return jsonify(corte.to_dict()), 201


# --- Gastos ---

@caja_bp.route("/gastos", methods=["GET"])
@roles_required("admin", "cajero")
def listar_gastos():
    return jsonify([g.to_dict() for g in Gasto.query.order_by(Gasto.fecha.desc()).all()]), 200


@caja_bp.route("/gastos", methods=["POST"])
@roles_required("admin", "cajero")
def crear_gasto():
    data = request.get_json(silent=True) or {}
    requeridos = ("concepto", "monto")
    if any(data.get(campo) is None for campo in requeridos):
        return jsonify({"error": f"Campos requeridos: {', '.join(requeridos)}"}), 400

    gasto = Gasto(
        id_caja=data.get("id_caja"),
        id_usuario=int(get_jwt_identity()),
        concepto=data["concepto"],
        monto=data["monto"],
        categoria=data.get("categoria"),
        comprobante=data.get("comprobante"),
    )
    db.session.add(gasto)
    db.session.commit()
    return jsonify(gasto.to_dict()), 201


# --- Compras de suministro ---

@caja_bp.route("/compras-suministro", methods=["GET"])
@roles_required("admin", "cajero")
def listar_compras():
    return jsonify(
        [c.to_dict() for c in CompraSuministro.query.order_by(CompraSuministro.fecha.desc()).all()]
    ), 200


@caja_bp.route("/compras-suministro", methods=["POST"])
@roles_required("admin", "cajero")
def crear_compra():
    data = request.get_json(silent=True) or {}
    if data.get("total") is None:
        return jsonify({"error": "total es requerido"}), 400

    compra = CompraSuministro(
        id_caja=data.get("id_caja"),
        id_usuario=int(get_jwt_identity()),
        proveedor=data.get("proveedor"),
        total=data["total"],
        estado=data.get("estado", "pendiente"),
        factura=data.get("factura"),
        notas=data.get("notas"),
    )
    db.session.add(compra)
    db.session.commit()
    return jsonify(compra.to_dict()), 201
