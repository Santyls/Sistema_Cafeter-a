from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from ..database import Base


class Caja(Base):
    __tablename__ = "caja"

    id_caja = Column(Integer, primary_key=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_apertura = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    fecha_cierre = Column(DateTime(timezone=True))
    fondo_inicial = Column(Numeric(10, 2), default=0)
    estado = Column(String(20), default="abierto")
    observaciones = Column(String(255))

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


class Ticket(Base):
    __tablename__ = "tickets"

    id_ticket = Column(Integer, primary_key=True)
    folio = Column(String(20), unique=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"))
    id_caja = Column(Integer, ForeignKey("caja.id_caja"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    total = Column(Numeric(10, 2), nullable=False)
    impuesto = Column(Numeric(10, 2), default=0)
    descuento = Column(Numeric(10, 2), default=0)
    estado = Column(String(30), default="pendiente")

    pagos = relationship("Pago", backref="ticket", lazy=True, cascade="all, delete-orphan")

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


class Pago(Base):
    __tablename__ = "pagos"

    id_pago = Column(Integer, primary_key=True)
    id_ticket = Column(Integer, ForeignKey("tickets.id_ticket"), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    tipo_pago = Column(String(30), nullable=False)
    referencia = Column(String(100))
    fecha_pago = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    cambio = Column(Numeric(10, 2), default=0)

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


class CorteCaja(Base):
    __tablename__ = "cortes_caja"

    id_corte = Column(Integer, primary_key=True)
    id_caja = Column(Integer, ForeignKey("caja.id_caja"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_corte = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    total_ventas = Column(Numeric(10, 2), default=0)
    total_efectivo = Column(Numeric(10, 2), default=0)
    total_tarjeta = Column(Numeric(10, 2), default=0)
    total_transferencia = Column(Numeric(10, 2), default=0)
    diferencia = Column(Numeric(10, 2), default=0)

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


class Gasto(Base):
    __tablename__ = "gastos"

    id_gasto = Column(Integer, primary_key=True)
    id_caja = Column(Integer, ForeignKey("caja.id_caja"))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    concepto = Column(String(150), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    categoria = Column(String(80))
    fecha = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    comprobante = Column(String(255))

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


class CompraSuministro(Base):
    __tablename__ = "compras_suministro"

    id_compra = Column(Integer, primary_key=True)
    id_caja = Column(Integer, ForeignKey("caja.id_caja"))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    proveedor = Column(String(150))
    total = Column(Numeric(10, 2), nullable=False)
    fecha = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    estado = Column(String(30), default="pendiente")
    factura = Column(String(100))
    notas = Column(String(255))

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
