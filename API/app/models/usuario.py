from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from werkzeug.security import check_password_hash, generate_password_hash

from ..database import Base

ROLES_VALIDOS = ("admin", "mesero", "cocinero", "cajero")


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    apellido_paterno = Column(String(100))
    apellido_materno = Column(String(100))
    telefono = Column(String(15))
    correo = Column(String(150), unique=True, nullable=False)
    usuario = Column(String(50), unique=True, nullable=False)
    contrasena_hash = Column(String(255), nullable=False)
    rol = Column(String(30), nullable=False)
    fecha_registro = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    activo = Column(Boolean, default=True)

    def set_password(self, password):
        self.contrasena_hash = generate_password_hash(password, method="pbkdf2")

    def check_password(self, password):
        return check_password_hash(self.contrasena_hash, password)

    def to_dict(self):
        return {
            "id_usuario": self.id_usuario,
            "nombre": self.nombre,
            "apellido_paterno": self.apellido_paterno,
            "apellido_materno": self.apellido_materno,
            "telefono": self.telefono,
            "correo": self.correo,
            "usuario": self.usuario,
            "rol": self.rol,
            "fecha_registro": self.fecha_registro.isoformat() if self.fecha_registro else None,
            "activo": self.activo,
        }
