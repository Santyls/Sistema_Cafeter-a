from ..extensions import db


class Categoria(db.Model):
    __tablename__ = "categorias"

    id_categoria = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255))
    activo = db.Column(db.Boolean, default=True)

    productos = db.relationship("Producto", backref="categoria", lazy=True)

    def to_dict(self):
        return {
            "id_categoria": self.id_categoria,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "activo": self.activo,
        }


class Producto(db.Model):
    __tablename__ = "productos"

    id_producto = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255))
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    imagen = db.Column(db.String(255))
    disponible = db.Column(db.Boolean, default=True)
    id_categoria = db.Column(db.Integer, db.ForeignKey("categorias.id_categoria"))

    recetas = db.relationship("Receta", backref="producto", lazy=True, cascade="all, delete-orphan")

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
