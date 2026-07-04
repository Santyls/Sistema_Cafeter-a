from datetime import datetime, timezone

from ..extensions import db

ESTADOS_PEDIDO = ("pendiente", "en_preparacion", "listo", "entregado", "cancelado")


class Pedido(db.Model):
    __tablename__ = "pedidos"

    id_pedido = db.Column(db.Integer, primary_key=True)
    numero_pedido = db.Column(db.String(20), unique=True)
    id_mesa = db.Column(db.Integer, db.ForeignKey("mesas.id_mesa"), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    fecha_actualizacion = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )
    estado = db.Column(db.String(30), default="pendiente")
    total = db.Column(db.Numeric(10, 2), default=0)
    metodo_pago = db.Column(db.String(50))
    observaciones = db.Column(db.String(255))

    mesa = db.relationship("Mesa")
    usuario = db.relationship("Usuario")
    detalles = db.relationship("DetallePedido", backref="pedido", lazy=True, cascade="all, delete-orphan")
    historial = db.relationship(
        "PedidoEstadoHistorial", backref="pedido", lazy=True, cascade="all, delete-orphan",
        order_by="PedidoEstadoHistorial.fecha_cambio",
    )

    def to_dict(self, with_detalles=False, with_historial=False):
        data = {
            "id_pedido": self.id_pedido,
            "numero_pedido": self.numero_pedido,
            "id_mesa": self.id_mesa,
            "id_usuario": self.id_usuario,
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


class DetallePedido(db.Model):
    __tablename__ = "detalle_pedido"

    id_detalle = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey("pedidos.id_pedido"), nullable=False)
    id_producto = db.Column(db.Integer, db.ForeignKey("productos.id_producto"), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False, default=1)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    observaciones = db.Column(db.String(255))

    producto = db.relationship("Producto")

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


class PedidoEstadoHistorial(db.Model):
    __tablename__ = "pedido_estado_historial"

    id_historial = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey("pedidos.id_pedido"), nullable=False)
    estado_anterior = db.Column(db.String(30))
    estado_nuevo = db.Column(db.String(30), nullable=False)
    fecha_cambio = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"))
    comentario = db.Column(db.String(255))

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
