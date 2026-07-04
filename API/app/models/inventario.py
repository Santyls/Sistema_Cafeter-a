from datetime import datetime, timezone

from ..extensions import db

TIPOS_MOVIMIENTO = ("entrada", "salida", "ajuste")


class InventarioMovimiento(db.Model):
    __tablename__ = "inventario_movimientos"

    id_movimiento = db.Column(db.Integer, primary_key=True)
    id_ingrediente = db.Column(db.Integer, db.ForeignKey("ingredientes.id_ingrediente"), nullable=False)
    tipo_movimiento = db.Column(db.String(20), nullable=False)
    cantidad = db.Column(db.Numeric(10, 2), nullable=False)
    stock_anterior = db.Column(db.Numeric(10, 2))
    stock_nuevo = db.Column(db.Numeric(10, 2))
    fecha_movimiento = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"))
    referencia = db.Column(db.String(100))
    observaciones = db.Column(db.String(255))

    ingrediente = db.relationship("Ingrediente")

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


class AlertaStock(db.Model):
    __tablename__ = "alertas_stock"

    id_alerta = db.Column(db.Integer, primary_key=True)
    id_ingrediente = db.Column(db.Integer, db.ForeignKey("ingredientes.id_ingrediente"), nullable=False)
    stock_actual = db.Column(db.Numeric(10, 2))
    stock_minimo = db.Column(db.Numeric(10, 2))
    fecha_alerta = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    atendida = db.Column(db.Boolean, default=False)
    fecha_atendida = db.Column(db.DateTime)

    ingrediente = db.relationship("Ingrediente")

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
