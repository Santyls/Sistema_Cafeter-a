from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from ..database import Base

TIPOS_MOVIMIENTO = ("entrada", "salida", "ajuste")


class InventarioMovimiento(Base):
    __tablename__ = "inventario_movimientos"

    id_movimiento = Column(Integer, primary_key=True)
    id_ingrediente = Column(Integer, ForeignKey("ingredientes.id_ingrediente"), nullable=False)
    tipo_movimiento = Column(String(20), nullable=False)
    cantidad = Column(Numeric(10, 2), nullable=False)
    stock_anterior = Column(Numeric(10, 2))
    stock_nuevo = Column(Numeric(10, 2))
    fecha_movimiento = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    referencia = Column(String(100))
    observaciones = Column(String(255))

    ingrediente = relationship("Ingrediente")

    def to_dict(self):
        return {
            "id_movimiento": self.id_movimiento,
            "id_ingrediente": self.id_ingrediente,
            "ingrediente_nombre": self.ingrediente.nombre if self.ingrediente else None,
            "tipo_movimiento": self.tipo_movimiento,
            "cantidad": float(self.cantidad),
            "stock_anterior": float(self.stock_anterior) if self.stock_anterior is not None else None,
            "stock_nuevo": float(self.stock_nuevo) if self.stock_nuevo is not None else None,
            "fecha_movimiento": self.fecha_movimiento.isoformat() if self.fecha_movimiento else None,
            "id_usuario": self.id_usuario,
            "referencia": self.referencia,
            "observaciones": self.observaciones,
        }


class AlertaStock(Base):
    __tablename__ = "alertas_stock"

    id_alerta = Column(Integer, primary_key=True)
    id_ingrediente = Column(Integer, ForeignKey("ingredientes.id_ingrediente"), nullable=False)
    stock_actual = Column(Numeric(10, 2))
    stock_minimo = Column(Numeric(10, 2))
    fecha_alerta = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    atendida = Column(Boolean, default=False)
    fecha_atendida = Column(DateTime(timezone=True))

    ingrediente = relationship("Ingrediente")

    def to_dict(self):
        return {
            "id_alerta": self.id_alerta,
            "id_ingrediente": self.id_ingrediente,
            "ingrediente_nombre": self.ingrediente.nombre if self.ingrediente else None,
            "stock_actual": float(self.stock_actual) if self.stock_actual is not None else None,
            "stock_minimo": float(self.stock_minimo) if self.stock_minimo is not None else None,
            "fecha_alerta": self.fecha_alerta.isoformat() if self.fecha_alerta else None,
            "atendida": self.atendida,
            "fecha_atendida": self.fecha_atendida.isoformat() if self.fecha_atendida else None,
        }
