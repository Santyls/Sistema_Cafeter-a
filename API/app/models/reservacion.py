from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Reservacion(Base):
    __tablename__ = "reservaciones"

    id_reservacion = Column(Integer, primary_key=True)
    nombre_cliente = Column(String(150), nullable=False)
    telefono = Column(String(30), nullable=False)
    id_mesa = Column(Integer, ForeignKey("mesas.id_mesa"), nullable=False)
    # Se conservan como texto (formato YYYY/MM/DD y HH:MM) para no romper el contrato
    # que ya consume la app movil.
    fecha = Column(String(30), nullable=False)
    hora = Column(String(30), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    mesa = relationship("Mesa")

    def to_dict(self):
        return {
            "id_reservacion": self.id_reservacion,
            "nombre_cliente": self.nombre_cliente,
            "telefono": self.telefono,
            "id_mesa": self.id_mesa,
            "mesa_numero": self.mesa.numero_mesa if self.mesa else None,
            "fecha": self.fecha,
            "hora": self.hora,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
        }
