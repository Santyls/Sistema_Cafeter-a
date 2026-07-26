from datetime import datetime, timezone
from ..extensions import db

class Reservacion(db.Model):
    __tablename__ = "reservaciones"

    id_reservacion = db.Column(db.Integer, primary_key=True)
    nombre_cliente = db.Column(db.String(150), nullable=False)
    telefono = db.Column(db.String(30), nullable=False)
    id_mesa = db.Column(db.Integer, db.ForeignKey("mesas.id_mesa"), nullable=False)
    fecha = db.Column(db.String(30), nullable=False) # e.g. YYYY-MM-DD
    hora = db.Column(db.String(30), nullable=False)  # e.g. HH:MM
    fecha_creacion = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    mesa = db.relationship("Mesa")

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
