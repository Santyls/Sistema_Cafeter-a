from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.security import get_claims, roles_required
from ..database import get_db
from ..models.pedido import DetallePedido, Pedido
from ..models.producto import Categoria, Producto
from ..schemas.common import MessageOut
from ..schemas.producto import (
    CategoriaCreate,
    CategoriaOut,
    CategoriaUpdate,
    ProductoCreate,
    ProductoOut,
    ProductoUpdate,
)

router = APIRouter(prefix="/api", tags=["Productos y Categorias"])

solo_admin = roles_required("admin")

# Un pedido en estos estados todavia esta vivo: cocina lo prepara o caja lo cobra.
ESTADOS_EN_CURSO = ("pendiente", "en_cocina", "en_preparacion", "listo")


# --- Categorias ---

@router.get("/categorias", response_model=list[CategoriaOut])
def listar_categorias(claims: dict = Depends(get_claims), db: Session = Depends(get_db)):
    categorias = db.query(Categoria).order_by(Categoria.nombre).all()
    return [c.to_dict() for c in categorias]


@router.post("/categorias", response_model=CategoriaOut, status_code=201)
def crear_categoria(
    data: CategoriaCreate, claims: dict = Depends(solo_admin), db: Session = Depends(get_db)
):
    categoria = Categoria(nombre=data.nombre, descripcion=data.descripcion, activo=data.activo)
    db.add(categoria)
    db.commit()
    return categoria.to_dict()


@router.put("/categorias/{id_categoria}", response_model=CategoriaOut)
def actualizar_categoria(
    id_categoria: int,
    data: CategoriaUpdate,
    claims: dict = Depends(solo_admin),
    db: Session = Depends(get_db),
):
    categoria = db.get(Categoria, id_categoria)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")

    cambios = data.model_dump(exclude_unset=True)
    for campo in ("nombre", "descripcion", "activo"):
        if campo in cambios:
            setattr(categoria, campo, cambios[campo])

    db.commit()
    return categoria.to_dict()


@router.delete("/categorias/{id_categoria}", response_model=MessageOut)
def eliminar_categoria(
    id_categoria: int, claims: dict = Depends(solo_admin), db: Session = Depends(get_db)
):
    categoria = db.get(Categoria, id_categoria)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")

    db.delete(categoria)
    db.commit()
    return {"message": "Categoria eliminada"}


# --- Productos ---

@router.get("/productos", response_model=list[ProductoOut])
def listar_productos(
    id_categoria: int | None = Query(default=None),
    disponible: str | None = Query(default=None),
    claims: dict = Depends(get_claims),
    db: Session = Depends(get_db),
):
    query = db.query(Producto)
    if id_categoria:
        query = query.filter_by(id_categoria=id_categoria)
    if disponible is not None:
        query = query.filter_by(disponible=disponible.lower() in ("1", "true", "si"))
    productos = query.order_by(Producto.nombre).all()
    return [p.to_dict() for p in productos]


@router.get("/productos/{id_producto}", response_model=ProductoOut)
def obtener_producto(
    id_producto: int, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    producto = db.get(Producto, id_producto)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto.to_dict()


@router.post("/productos", response_model=ProductoOut, status_code=201)
def crear_producto(
    data: ProductoCreate, claims: dict = Depends(solo_admin), db: Session = Depends(get_db)
):
    producto = Producto(
        nombre=data.nombre,
        descripcion=data.descripcion,
        precio=data.precio,
        imagen=data.imagen,
        disponible=data.disponible,
        id_categoria=data.id_categoria,
    )
    db.add(producto)
    db.commit()
    return producto.to_dict()


@router.put("/productos/{id_producto}", response_model=ProductoOut)
def actualizar_producto(
    id_producto: int,
    data: ProductoUpdate,
    claims: dict = Depends(solo_admin),
    db: Session = Depends(get_db),
):
    producto = db.get(Producto, id_producto)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    cambios = data.model_dump(exclude_unset=True)
    for campo in ("nombre", "descripcion", "precio", "imagen", "disponible", "id_categoria"):
        if campo in cambios:
            setattr(producto, campo, cambios[campo])

    db.commit()
    return producto.to_dict()


@router.delete("/productos/{id_producto}", response_model=MessageOut)
def eliminar_producto(
    id_producto: int, claims: dict = Depends(solo_admin), db: Session = Depends(get_db)
):
    producto = db.get(Producto, id_producto)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Un producto que esta en un pedido sin terminar no se puede quitar: se estaria
    # borrando algo que la cocina todavia tiene que preparar o la caja tiene que cobrar.
    en_pedidos_abiertos = (
        db.query(DetallePedido)
        .join(Pedido, Pedido.id_pedido == DetallePedido.id_pedido)
        .filter(
            DetallePedido.id_producto == id_producto,
            Pedido.estado.in_(ESTADOS_EN_CURSO),
        )
        .count()
    )
    if en_pedidos_abiertos:
        raise HTTPException(
            status_code=409,
            detail=(
                f"'{producto.nombre}' esta en {en_pedidos_abiertos} pedido(s) en curso. "
                "Espera a que se entreguen o se cancelen."
            ),
        )

    # Aunque ya no haya pedidos en curso, el producto sigue apareciendo en el historial
    # de ventas. Borrarlo dejaria tickets viejos sin poder decir que se vendio, asi que
    # se marca como no disponible: desaparece del menu y el historial queda intacto.
    historico = (
        db.query(DetallePedido).filter(DetallePedido.id_producto == id_producto).count()
    )
    if historico:
        producto.disponible = False
        db.commit()
        return {
            "message": (
                f"'{producto.nombre}' se marco como no disponible y ya no aparece en el menu. "
                f"No se elimino porque forma parte de {historico} venta(s) del historial."
            )
        }

    db.delete(producto)
    db.commit()
    return {"message": "Producto eliminado"}
