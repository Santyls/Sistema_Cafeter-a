from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Reservacion(Base):
    __tablename__ = "reservaciones"

    id_reservacion = Column(Integer, primary_key=True)
    nombre_cliente = Column(String(150), nullable=False)
    telefono = Column(String(30), nullable=False)
    numero_personas = Column(Integer, default=1, nullable=False)
    id_mesa = Column(Integer, ForeignKey("mesas.id_mesa"), nullable=False)
    # Antes se guardaba como dos textos (fecha "YYYY/MM/DD" y hora "HH:MM"), lo que hacia
    # imposible comparar tiempos: no se podia saber que reservaciones estan por llegar
    # para bloquear la mesa. Ahora es un instante real.
    fecha_hora = Column(DateTime(timezone=True), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    mesa = relationship("Mesa")

    def to_dict(self):
        return {
            "id_reservacion": self.id_reservacion,
            "nombre_cliente": self.nombre_cliente,
            "telefono": self.telefono,
            "numero_personas": self.numero_personas,
            "id_mesa": self.id_mesa,
            "mesa_numero": self.mesa.numero_mesa if self.mesa else None,
            "fecha_hora": self.fecha_hora.isoformat() if self.fecha_hora else None,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
        }
