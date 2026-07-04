from ..extensions import db

ESTADOS_MESA = ("disponible", "ocupada", "reservada")


class Mesa(db.Model):
    __tablename__ = "mesas"

    id_mesa = db.Column(db.Integer, primary_key=True)
    numero_mesa = db.Column(db.Integer, unique=True, nullable=False)
    capacidad = db.Column(db.Integer, default=4)
    ubicacion = db.Column(db.String(100))
    estado = db.Column(db.String(30), default="disponible")

    def to_dict(self):
        return {
            "id_mesa": self.id_mesa,
            "numero_mesa": self.numero_mesa,
            "capacidad": self.capacidad,
            "ubicacion": self.ubicacion,
            "estado": self.estado,
        }
