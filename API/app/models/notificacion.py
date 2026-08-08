from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from ..database import Base


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id_notificacion = Column(Integer, primary_key=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"), nullable=True)
    tipo = Column(String(30), nullable=False)
    mensaje = Column(String(255), nullable=False)
    id_receptor = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    estado = Column(String(20), default="enviada")
    fecha_envio = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    fecha_lectura = Column(DateTime(timezone=True))

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
