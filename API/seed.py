"""Carga datos iniciales de ejemplo: usuarios, mesas, categorias, productos e ingredientes."""

from app import create_app
from app.extensions import db
from app.models.ingrediente import Ingrediente, Receta
from app.models.mesa import Mesa
from app.models.producto import Categoria, Producto
from app.models.usuario import Usuario

app = create_app()

with app.app_context():
    if Usuario.query.first():
        print("La base de datos ya tiene informacion. No se vuelve a sembrar.")
        raise SystemExit(0)

    admin = Usuario(nombre="Admin", apellido_paterno="Sistema", correo="admin@cafeteria.com", usuario="admin", rol="admin")
    admin.set_password("admin123")

    mesero = Usuario(nombre="Santiago", apellido_paterno="Mesero", correo="santiago@cafeteria.com", usuario="santiago", rol="mesero")
    mesero.set_password("mesero123")

    cocinero = Usuario(nombre="BP", apellido_paterno="Cocina", correo="bp@cafeteria.com", usuario="bp", rol="cocinero")
    cocinero.set_password("cocina123")

    cajero = Usuario(nombre="Alberto", apellido_paterno="Caja", correo="alberto@cafeteria.com", usuario="alberto", rol="cajero")
    cajero.set_password("caja123")

    db.session.add_all([admin, mesero, cocinero, cajero])

    mesas = [
        Mesa(numero_mesa=1, capacidad=2, ubicacion="Salon principal"),
        Mesa(numero_mesa=2, capacidad=3, ubicacion="Salon principal"),
        Mesa(numero_mesa=3, capacidad=4, ubicacion="Salon principal"),
        Mesa(numero_mesa=4, capacidad=5, ubicacion="Salon principal"),
        Mesa(numero_mesa=5, capacidad=6, ubicacion="Salon principal"),
        Mesa(numero_mesa=6, capacidad=7, ubicacion="Salon principal"),
        Mesa(numero_mesa=7, capacidad=8, ubicacion="Salon principal"),
        Mesa(numero_mesa=8, capacidad=9, ubicacion="Salon principal"),
        Mesa(numero_mesa=9, capacidad=10, ubicacion="Salon principal"),
        Mesa(numero_mesa=10, capacidad=11, ubicacion="Terraza"),
        Mesa(numero_mesa=11, capacidad=12, ubicacion="VIP"),
        Mesa(numero_mesa=12, capacidad=15, ubicacion="VIP"),
    ]
    db.session.add_all(mesas)

    cat_bebidas = Categoria(nombre="Bebidas Calientes", descripcion="Cafe, te y bebidas calientes")
    cat_frias = Categoria(nombre="Bebidas Frias", descripcion="Frappes, smoothies e iced drinks")
    cat_postres = Categoria(nombre="Postres", descripcion="Panaderia y reposteria")
    db.session.add_all([cat_bebidas, cat_frias, cat_postres])
    db.session.flush()

    cafe_grano = Ingrediente(nombre="Cafe en grano", unidad_medida="kg", stock_actual=25, stock_minimo=5)
    leche = Ingrediente(nombre="Leche entera", unidad_medida="L", stock_actual=15, stock_minimo=5)
    db.session.add_all([cafe_grano, leche])
    db.session.flush()

    americano = Producto(nombre="Cafe Americano", descripcion="Cafe negro clasico", precio=45, id_categoria=cat_bebidas.id_categoria)
    capuchino = Producto(nombre="Capuchino Clasico", descripcion="Espresso con leche texturizada", precio=65, id_categoria=cat_bebidas.id_categoria)
    db.session.add_all([americano, capuchino])
    db.session.flush()

    db.session.add_all([
        Receta(id_producto=americano.id_producto, id_ingrediente=cafe_grano.id_ingrediente, cantidad_requerida=0.02),
        Receta(id_producto=capuchino.id_producto, id_ingrediente=cafe_grano.id_ingrediente, cantidad_requerida=0.02),
        Receta(id_producto=capuchino.id_producto, id_ingrediente=leche.id_ingrediente, cantidad_requerida=0.15),
    ])

    db.session.commit()
    print("Datos de ejemplo creados correctamente.")
    print("Usuarios: admin/admin123, mesero1/mesero123, cocinero1/cocinero123, cajero1/cajero123")
