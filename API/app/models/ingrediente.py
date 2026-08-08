from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from ..database import Base


class Ingrediente(Base):
    __tablename__ = "ingredientes"

    id_ingrediente = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    unidad_medida = Column(String(20), nullable=False)
    stock_actual = Column(Numeric(10, 2), default=0)
    stock_minimo = Column(Numeric(10, 2), default=0)
    activo = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "id_ingrediente": self.id_ingrediente,
            "nombre": self.nombre,
            "unidad_medida": self.unidad_medida,
            "stock_actual": float(self.stock_actual) if self.stock_actual is not None else None,
            "stock_minimo": float(self.stock_minimo) if self.stock_minimo is not None else None,
            "activo": self.activo,
        }


class Receta(Base):
    __tablename__ = "receta"

    id_receta = Column(Integer, primary_key=True)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=False)
    id_ingrediente = Column(Integer, ForeignKey("ingredientes.id_ingrediente"), nullable=False)
    cantidad_requerida = Column(Numeric(10, 2), nullable=False)

    ingrediente = relationship("Ingrediente")

    def to_dict(self):
        return {
            "id_receta": self.id_receta,
            "id_producto": self.id_producto,
            "id_ingrediente": self.id_ingrediente,
            "ingrediente_nombre": self.ingrediente.nombre if self.ingrediente else None,
            "cantidad_requerida": float(self.cantidad_requerida),
        }
