from datetime import datetime, timezone

from ..extensions import db


class Notificacion(db.Model):
    __tablename__ = "notificaciones"

    id_notificacion = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey("pedidos.id_pedido"), nullable=True)
    tipo = db.Column(db.String(30), nullable=False)
    mensaje = db.Column(db.String(255), nullable=False)
    id_receptor = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"), nullable=False)
    estado = db.Column(db.String(20), default="enviada")
    fecha_envio = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    fecha_lectura = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "id_notificacion": self.id_notificacion,
            "id_pedido": self.id_pedido,
            "tipo": self.tipo,
            "mensaje": self.mensaje,
            "id_receptor": self.id_receptor,
            "estado": self.estado,
            "fecha_envio": self.fecha_envio.isoformat() if self.fecha_envio else None,
            "fecha_lectura": self.fecha_lectura.isoformat() if self.fecha_lectura else None,
        }
