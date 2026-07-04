from datetime import datetime, timezone

from ..extensions import db


class Caja(db.Model):
    __tablename__ = "caja"

    id_caja = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_apertura = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    fecha_cierre = db.Column(db.DateTime)
    fondo_inicial = db.Column(db.Numeric(10, 2), default=0)
    estado = db.Column(db.String(20), default="abierto")
    observaciones = db.Column(db.String(255))

    def to_dict(self):
        return {
            "id_caja": self.id_caja,
            "id_usuario": self.id_usuario,
            "fecha_apertura": self.fecha_apertura.isoformat() if self.fecha_apertura else None,
            "fecha_cierre": self.fecha_cierre.isoformat() if self.fecha_cierre else None,
            "fondo_inicial": float(self.fondo_inicial) if self.fondo_inicial is not None else None,
            "estado": self.estado,
            "observaciones": self.observaciones,
        }


class Ticket(db.Model):
    __tablename__ = "tickets"

    id_ticket = db.Column(db.Integer, primary_key=True)
    folio = db.Column(db.String(20), unique=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey("pedidos.id_pedido"))
    id_caja = db.Column(db.Integer, db.ForeignKey("caja.id_caja"), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    total = db.Column(db.Numeric(10, 2), nullable=False)
    impuesto = db.Column(db.Numeric(10, 2), default=0)
    descuento = db.Column(db.Numeric(10, 2), default=0)
    estado = db.Column(db.String(30), default="pendiente")

    pagos = db.relationship("Pago", backref="ticket", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, with_pagos=False):
        data = {
            "id_ticket": self.id_ticket,
            "folio": self.folio,
            "id_pedido": self.id_pedido,
            "id_caja": self.id_caja,
            "id_usuario": self.id_usuario,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "total": float(self.total),
            "impuesto": float(self.impuesto) if self.impuesto is not None else None,
            "descuento": float(self.descuento) if self.descuento is not None else None,
            "estado": self.estado,
        }
        if with_pagos:
            data["pagos"] = [p.to_dict() for p in self.pagos]
        return data


class Pago(db.Model):
    __tablename__ = "pagos"

    id_pago = db.Column(db.Integer, primary_key=True)
    id_ticket = db.Column(db.Integer, db.ForeignKey("tickets.id_ticket"), nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    tipo_pago = db.Column(db.String(30), nullable=False)
    referencia = db.Column(db.String(100))
    fecha_pago = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    cambio = db.Column(db.Numeric(10, 2), default=0)

    def to_dict(self):
        return {
            "id_pago": self.id_pago,
            "id_ticket": self.id_ticket,
            "monto": float(self.monto),
            "tipo_pago": self.tipo_pago,
            "referencia": self.referencia,
            "fecha_pago": self.fecha_pago.isoformat() if self.fecha_pago else None,
            "cambio": float(self.cambio) if self.cambio is not None else None,
        }


class CorteCaja(db.Model):
    __tablename__ = "cortes_caja"

    id_corte = db.Column(db.Integer, primary_key=True)
    id_caja = db.Column(db.Integer, db.ForeignKey("caja.id_caja"), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_corte = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    total_ventas = db.Column(db.Numeric(10, 2), default=0)
    total_efectivo = db.Column(db.Numeric(10, 2), default=0)
    total_tarjeta = db.Column(db.Numeric(10, 2), default=0)
    total_transferencia = db.Column(db.Numeric(10, 2), default=0)
    diferencia = db.Column(db.Numeric(10, 2), default=0)

    def to_dict(self):
        return {
            "id_corte": self.id_corte,
            "id_caja": self.id_caja,
            "id_usuario": self.id_usuario,
            "fecha_corte": self.fecha_corte.isoformat() if self.fecha_corte else None,
            "total_ventas": float(self.total_ventas),
            "total_efectivo": float(self.total_efectivo),
            "total_tarjeta": float(self.total_tarjeta),
            "total_transferencia": float(self.total_transferencia),
            "diferencia": float(self.diferencia),
        }


class Gasto(db.Model):
    __tablename__ = "gastos"

    id_gasto = db.Column(db.Integer, primary_key=True)
    id_caja = db.Column(db.Integer, db.ForeignKey("caja.id_caja"))
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"), nullable=False)
    concepto = db.Column(db.String(150), nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    categoria = db.Column(db.String(80))
    fecha = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    comprobante = db.Column(db.String(255))

    def to_dict(self):
        return {
            "id_gasto": self.id_gasto,
            "id_caja": self.id_caja,
            "id_usuario": self.id_usuario,
            "concepto": self.concepto,
            "monto": float(self.monto),
            "categoria": self.categoria,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "comprobante": self.comprobante,
        }


class CompraSuministro(db.Model):
    __tablename__ = "compras_suministro"

    id_compra = db.Column(db.Integer, primary_key=True)
    id_caja = db.Column(db.Integer, db.ForeignKey("caja.id_caja"))
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"), nullable=False)
    proveedor = db.Column(db.String(150))
    total = db.Column(db.Numeric(10, 2), nullable=False)
    fecha = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    estado = db.Column(db.String(30), default="pendiente")
    factura = db.Column(db.String(100))
    notas = db.Column(db.String(255))

    def to_dict(self):
        return {
            "id_compra": self.id_compra,
            "id_caja": self.id_caja,
            "id_usuario": self.id_usuario,
            "proveedor": self.proveedor,
            "total": float(self.total),
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "estado": self.estado,
            "factura": self.factura,
            "notas": self.notas,
        }
