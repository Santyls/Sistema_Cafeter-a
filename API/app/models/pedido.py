from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from ..database import Base

ESTADOS_PEDIDO = ("pendiente", "en_preparacion", "listo", "entregado", "cancelado")


class Pedido(Base):
    __tablename__ = "pedidos"

    id_pedido = Column(Integer, primary_key=True)
    numero_pedido = Column(String(20), unique=True)
    id_mesa = Column(Integer, ForeignKey("mesas.id_mesa"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    fecha_actualizacion = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    estado = Column(String(30), default="pendiente")
    total = Column(Numeric(10, 2), default=0)
    metodo_pago = Column(String(50))
    observaciones = Column(String(255))

    mesa = relationship("Mesa")
    usuario = relationship("Usuario")
    detalles = relationship("DetallePedido", backref="pedido", lazy=True, cascade="all, delete-orphan")
    historial = relationship(
        "PedidoEstadoHistorial", backref="pedido", lazy=True, cascade="all, delete-orphan",
        order_by="PedidoEstadoHistorial.fecha_cambio",
    )

    def to_dict(self, with_detalles=False, with_historial=False):
        data = {
            "id_pedido": self.id_pedido,
            "numero_pedido": self.numero_pedido,
            "id_mesa": self.id_mesa,
            "mesa_numero": self.mesa.numero_mesa if self.mesa else None,
            "id_usuario": self.id_usuario,
            "usuario_nombre": (
                f"{self.usuario.nombre} {self.usuario.apellido_paterno or ''}".strip()
                if self.usuario else None
            ),
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            "estado": self.estado,
            "total": float(self.total) if self.total is not None else None,
            "metodo_pago": self.metodo_pago,
            "observaciones": self.observaciones,
        }
        if with_detalles:
            data["detalles"] = [d.to_dict() for d in self.detalles]
        if with_historial:
            data["historial"] = [h.to_dict() for h in self.historial]
        return data


class DetallePedido(Base):
    __tablename__ = "detalle_pedido"

    id_detalle = Column(Integer, primary_key=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    observaciones = Column(String(255))

    producto = relationship("Producto")

    def to_dict(self):
        return {
            "id_detalle": self.id_detalle,
            "id_pedido": self.id_pedido,
            "id_producto": self.id_producto,
            "producto_nombre": self.producto.nombre if self.producto else None,
            "cantidad": self.cantidad,
            "precio_unitario": float(self.precio_unitario),
            "subtotal": float(self.subtotal),
            "observaciones": self.observaciones,
        }


class PedidoEstadoHistorial(Base):
    __tablename__ = "pedido_estado_historial"

    id_historial = Column(Integer, primary_key=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"), nullable=False)
    estado_anterior = Column(String(30))
    estado_nuevo = Column(String(30), nullable=False)
    fecha_cambio = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    comentario = Column(String(255))

    def to_dict(self):
        return {
            "id_historial": self.id_historial,
            "id_pedido": self.id_pedido,
            "estado_anterior": self.estado_anterior,
            "estado_nuevo": self.estado_nuevo,
            "fecha_cambio": self.fecha_cambio.isoformat() if self.fecha_cambio else None,
            "id_usuario": self.id_usuario,
            "comentario": self.comentario,
        }
