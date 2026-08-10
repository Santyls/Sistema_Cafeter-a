"""
Da de alta las recetas que le faltan a los productos del menu.

Sin receta un producto no consume nada: se podia vender un Cheesecake de Fresa cien
veces y el inventario de fresa no se movia. Este script completa los ingredientes que
faltaban y arma la receta de cada producto a partir de su nombre y su categoria, que es
como se distinguen unos de otros en el menu (lo que lleva "latte" lleva leche, lo que
lleva "fresa" lleva fresa, y asi).

Es idempotente: no duplica ingredientes ni recetas, y solo toca los productos que aun
no tienen una.

Uso:  docker compose exec api python seed_recetas.py
"""

from app.database import SessionLocal
from app.models.ingrediente import Ingrediente, Receta
from app.models.producto import Producto

# Ingredientes que faltaban para poder describir el menu completo.
INGREDIENTES_NUEVOS = [
    ("Queso crema", "kg", 6, 2),
    ("Huevo", "pzas", 90, 30),
    ("Pan de caja", "pzas", 60, 20),
    ("Tocino", "kg", 4, 1.5),
    ("Aguacate", "pzas", 25, 10),
    ("Platano", "kg", 8, 3),
    ("Crema batida", "L", 5, 2),
    ("Helado de vainilla", "L", 6, 2),
    ("Te negro (hojas)", "kg", 1.5, 0.5),
    ("Matcha", "kg", 1, 0.3),
    ("Jarabe de caramelo", "L", 3, 1),
    ("Avena", "kg", 5, 2),
    ("Yogur natural", "L", 6, 2),
    ("Miel", "L", 3, 1),
    ("Nuez", "kg", 2, 0.8),
    ("Queso manchego", "kg", 4, 1.5),
    ("Jamon", "kg", 4, 1.5),
    ("Agua mineral", "L", 30, 10),
    ("Naranja", "kg", 10, 4),
]

# Base fija por categoria: lo que lleva cualquier producto de ese tipo.
BASE_POR_CATEGORIA = {
    "Bebidas Calientes": [("Azucar", 0.01)],
    "Bebidas Frias": [("Hielo", 0.15)],
    "Postres": [("Azucar", 0.03)],
    "Desayunos": [],
}

# Ingredientes que se deducen del nombre del producto. El orden importa: se aplica la
# primera coincidencia de cada ingrediente, no todas.
POR_PALABRA = [
    ("espresso", [("Cafe en grano", 0.018)]),
    ("americano", [("Cafe en grano", 0.02)]),
    ("capuchino", [("Cafe en grano", 0.02), ("Leche entera", 0.15)]),
    ("cappuccino", [("Cafe en grano", 0.02), ("Leche entera", 0.15)]),
    ("latte", [("Cafe en grano", 0.02), ("Leche entera", 0.18)]),
    ("moka", [("Cafe en grano", 0.02), ("Chocolate en polvo", 0.03), ("Leche entera", 0.12)]),
    ("mocha", [("Cafe en grano", 0.02), ("Chocolate en polvo", 0.03), ("Leche entera", 0.12)]),
    ("macchiato", [("Cafe en grano", 0.02), ("Leche entera", 0.06)]),
    ("cortado", [("Cafe en grano", 0.02), ("Leche entera", 0.06)]),
    ("affogato", [("Cafe en grano", 0.018), ("Helado de vainilla", 0.12)]),
    ("frappe", [("Hielo", 0.2), ("Leche entera", 0.12)]),
    ("cafe", [("Cafe en grano", 0.02)]),
    ("café", [("Cafe en grano", 0.02)]),
    ("matcha", [("Matcha", 0.008), ("Leche entera", 0.15)]),
    ("chai", [("Te chai (hojas)", 0.01), ("Leche entera", 0.12)]),
    ("te ", [("Te negro (hojas)", 0.008)]),
    ("té ", [("Te negro (hojas)", 0.008)]),
    ("chocolate", [("Chocolate en polvo", 0.03), ("Leche entera", 0.15)]),
    ("cheesecake", [("Queso crema", 0.09), ("Harina", 0.05), ("Mantequilla", 0.03)]),
    ("pay de queso", [("Queso crema", 0.09), ("Harina", 0.08), ("Mantequilla", 0.05)]),
    ("brownie", [("Chocolate en polvo", 0.05), ("Harina", 0.06), ("Mantequilla", 0.04)]),
    ("muffin", [("Harina", 0.06), ("Mantequilla", 0.03)]),
    ("croissant", [("Harina", 0.07), ("Mantequilla", 0.04)]),
    ("waffle", [("Harina", 0.08), ("Huevo", 1), ("Mantequilla", 0.02)]),
    ("hotcake", [("Harina", 0.08), ("Huevo", 1), ("Leche entera", 0.1)]),
    ("pancake", [("Harina", 0.08), ("Huevo", 1), ("Leche entera", 0.1)]),
    ("pastel", [("Harina", 0.08), ("Huevo", 1), ("Mantequilla", 0.04)]),
    ("galleta", [("Harina", 0.04), ("Mantequilla", 0.02)]),
    ("alfajor", [("Harina", 0.04), ("Mantequilla", 0.02)]),
    ("dona", [("Harina", 0.05), ("Mantequilla", 0.02)]),
    ("flan", [("Huevo", 2), ("Leche entera", 0.15)]),
    ("tiramisu", [("Queso crema", 0.07), ("Cafe en grano", 0.01)]),
    ("bagel", [("Pan de caja", 1), ("Queso crema", 0.04)]),
    ("sandwich", [("Pan de caja", 2)]),
    ("panini", [("Pan de caja", 2), ("Queso manchego", 0.04)]),
    ("toast", [("Pan de caja", 2)]),
    ("tostada", [("Pan de caja", 2)]),
    ("omelette", [("Huevo", 3)]),
    ("huevo", [("Huevo", 2)]),
    ("chilaquiles", [("Huevo", 1), ("Queso manchego", 0.03)]),
    ("avena", [("Avena", 0.06), ("Leche entera", 0.2)]),
    ("yogur", [("Yogur natural", 0.2), ("Miel", 0.02)]),
    ("smoothie", [("Hielo", 0.15)]),
    ("malteada", [("Leche entera", 0.2), ("Helado de vainilla", 0.1)]),
    ("limonada", [("Limon", 0.1), ("Azucar", 0.02)]),
    ("naranja", [("Naranja", 0.25)]),
    ("soda", [("Agua mineral", 0.35)]),
    ("agua mineral", [("Agua mineral", 0.35)]),
    ("fresa", [("Fresa", 0.12)]),
    ("platano", [("Platano", 0.12)]),
    ("plátano", [("Platano", 0.12)]),
    ("nutella", [("Chocolate en polvo", 0.04)]),
    ("caramelo", [("Jarabe de caramelo", 0.03)]),
    ("vainilla", [("Jarabe de vainilla", 0.03)]),
    ("nuez", [("Nuez", 0.03)]),
    ("miel", [("Miel", 0.02)]),
    ("tocino", [("Tocino", 0.05)]),
    ("jamon", [("Jamon", 0.05)]),
    ("jamón", [("Jamon", 0.05)]),
    ("aguacate", [("Aguacate", 0.5)]),
    ("queso", [("Queso manchego", 0.05)]),
    ("crema batida", [("Crema batida", 0.04)]),
]

# Si el nombre no dice nada reconocible, al menos consume algo de su categoria.
RESPALDO_POR_CATEGORIA = {
    "Bebidas Calientes": [("Leche entera", 0.12)],
    "Bebidas Frias": [("Agua mineral", 0.3)],
    "Postres": [("Harina", 0.05), ("Mantequilla", 0.02)],
    "Desayunos": [("Pan de caja", 1), ("Huevo", 1)],
}


def ingredientes_de(nombre: str, categoria: str) -> dict:
    """Arma {ingrediente: cantidad} para un producto, sin repetir ingredientes."""
    texto = nombre.lower()
    receta = {}

    for ingrediente, cantidad in BASE_POR_CATEGORIA.get(categoria, []):
        receta[ingrediente] = cantidad

    for palabra, items in POR_PALABRA:
        if palabra in texto:
            for ingrediente, cantidad in items:
                receta.setdefault(ingrediente, cantidad)

    # Solo la base de la categoria no describe nada: se usa el respaldo.
    if len(receta) <= len(BASE_POR_CATEGORIA.get(categoria, [])):
        for ingrediente, cantidad in RESPALDO_POR_CATEGORIA.get(categoria, []):
            receta.setdefault(ingrediente, cantidad)

    return receta


def main():
    db = SessionLocal()
    try:
        creados = 0
        for nombre, unidad, stock, minimo in INGREDIENTES_NUEVOS:
            if not db.query(Ingrediente).filter_by(nombre=nombre).first():
                db.add(
                    Ingrediente(
                        nombre=nombre, unidad_medida=unidad, stock_actual=stock, stock_minimo=minimo
                    )
                )
                creados += 1
        db.commit()
        print(f"Ingredientes nuevos: {creados}")

        por_nombre = {i.nombre: i for i in db.query(Ingrediente).all()}

        sin_receta = [p for p in db.query(Producto).all() if not p.recetas]
        print(f"Productos sin receta: {len(sin_receta)}")

        recetas_creadas = 0
        sin_resolver = []
        for producto in sin_receta:
            categoria = producto.categoria.nombre if producto.categoria else ""
            receta = ingredientes_de(producto.nombre, categoria)

            if not receta:
                sin_resolver.append(producto.nombre)
                continue

            for nombre_ing, cantidad in receta.items():
                ingrediente = por_nombre.get(nombre_ing)
                if not ingrediente:
                    continue
                db.add(
                    Receta(
                        id_producto=producto.id_producto,
                        id_ingrediente=ingrediente.id_ingrediente,
                        cantidad_requerida=cantidad,
                    )
                )
                recetas_creadas += 1

        db.commit()
        print(f"Renglones de receta creados: {recetas_creadas}")
        if sin_resolver:
            print(f"Sin receta (revisar a mano): {', '.join(sin_resolver)}")

        con_receta = sum(1 for p in db.query(Producto).all() if p.recetas)
        total = db.query(Producto).count()
        print(f"Productos con receta: {con_receta}/{total}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
