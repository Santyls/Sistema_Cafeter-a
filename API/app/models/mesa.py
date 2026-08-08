from sqlalchemy import Column, Integer, String

from ..database import Base

ESTADOS_MESA = ("disponible", "ocupada", "reservada")


class Mesa(Base):
    __tablename__ = "mesas"

    id_mesa = Column(Integer, primary_key=True)
    numero_mesa = Column(Integer, unique=True, nullable=False)
    capacidad = Column(Integer, default=4)
    ubicacion = Column(String(100))
    estado = Column(String(30), default="disponible")

    def to_dict(self):
        return {
            "id_mesa": self.id_mesa,
            "numero_mesa": self.numero_mesa,
            "capacidad": self.capacidad,
            "ubicacion": self.ubicacion,
            "estado": self.estado,
        }
