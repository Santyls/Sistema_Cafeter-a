from ..extensions import db


class Ingrediente(db.Model):
    __tablename__ = "ingredientes"

    id_ingrediente = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    unidad_medida = db.Column(db.String(20), nullable=False)
    stock_actual = db.Column(db.Numeric(10, 2), default=0)
    stock_minimo = db.Column(db.Numeric(10, 2), default=0)
    activo = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id_ingrediente": self.id_ingrediente,
            "nombre": self.nombre,
            "unidad_medida": self.unidad_medida,
            "stock_actual": float(self.stock_actual) if self.stock_actual is not None else None,
            "stock_minimo": float(self.stock_minimo) if self.stock_minimo is not None else None,
            "activo": self.activo,
        }


class Receta(db.Model):
    __tablename__ = "receta"

    id_receta = db.Column(db.Integer, primary_key=True)
    id_producto = db.Column(db.Integer, db.ForeignKey("productos.id_producto"), nullable=False)
    id_ingrediente = db.Column(db.Integer, db.ForeignKey("ingredientes.id_ingrediente"), nullable=False)
    cantidad_requerida = db.Column(db.Numeric(10, 2), nullable=False)

    ingrediente = db.relationship("Ingrediente")

    def to_dict(self):
        return {
            "id_receta": self.id_receta,
            "id_producto": self.id_producto,
            "id_ingrediente": self.id_ingrediente,
            "ingrediente_nombre": self.ingrediente.nombre if self.ingrediente else None,
            "cantidad_requerida": float(self.cantidad_requerida),
        }
