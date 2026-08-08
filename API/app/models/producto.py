from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from ..database import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id_categoria = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    activo = Column(Boolean, default=True)

    productos = relationship("Producto", backref="categoria", lazy=True)

    def to_dict(self):
        return {
            "id_categoria": self.id_categoria,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "activo": self.activo,
        }


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    precio = Column(Numeric(10, 2), nullable=False)
    imagen = Column(String(255))
    disponible = Column(Boolean, default=True)
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria"))

    recetas = relationship("Receta", backref="producto", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id_producto": self.id_producto,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "precio": float(self.precio) if self.precio is not None else None,
            "imagen": self.imagen,
            "disponible": self.disponible,
            "id_categoria": self.id_categoria,
        }
