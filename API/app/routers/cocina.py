from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.security import get_claims, roles_required
from ..database import get_db
from ..models.ingrediente import Ingrediente, Receta
from ..models.inventario import TIPOS_MOVIMIENTO, AlertaStock, InventarioMovimiento
from ..schemas.cocina import (
    AlertaOut,
    IngredienteCreate,
    IngredienteOut,
    IngredienteUpdate,
    MovimientoCreate,
    MovimientoOut,
    RecetaCreate,
    RecetaOut,
)
from ..schemas.common import MessageOut

router = APIRouter(prefix="/api", tags=["Cocina e Inventario"])

admin_o_cocinero = roles_required("admin", "cocinero")


# --- Ingredientes ---

@router.get("/ingredientes", response_model=list[IngredienteOut])
def listar_ingredientes(
    stock_bajo: str | None = Query(default=None),
    claims: dict = Depends(get_claims),
    db: Session = Depends(get_db),
):
    ingredientes = db.query(Ingrediente).order_by(Ingrediente.nombre).all()
    if stock_bajo and stock_bajo.lower() in ("1", "true", "si"):
        ingredientes = [i for i in ingredientes if float(i.stock_actual) < float(i.stock_minimo)]
    return [i.to_dict() for i in ingredientes]


@router.get("/ingredientes/{id_ingrediente}", response_model=IngredienteOut)
def obtener_ingrediente(
    id_ingrediente: int, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    ingrediente = db.get(Ingrediente, id_ingrediente)
    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    return ingrediente.to_dict()


@router.post("/ingredientes", response_model=IngredienteOut, status_code=201)
def crear_ingrediente(
    data: IngredienteCreate, claims: dict = Depends(admin_o_cocinero), db: Session = Depends(get_db)
):
    ingrediente = Ingrediente(
        nombre=data.nombre,
        unidad_medida=data.unidad_medida,
        stock_actual=data.stock_actual,
        stock_minimo=data.stock_minimo,
        activo=data.activo,
    )
    db.add(ingrediente)
    db.commit()
    return ingrediente.to_dict()


@router.put("/ingredientes/{id_ingrediente}", response_model=IngredienteOut)
def actualizar_ingrediente(
    id_ingrediente: int,
    data: IngredienteUpdate,
    claims: dict = Depends(admin_o_cocinero),
    db: Session = Depends(get_db),
):
    ingrediente = db.get(Ingrediente, id_ingrediente)
    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")

    cambios = data.model_dump(exclude_unset=True)
    for campo in ("nombre", "unidad_medida", "stock_actual", "stock_minimo", "activo"):
        if campo in cambios:
            setattr(ingrediente, campo, cambios[campo])

    db.commit()
    return ingrediente.to_dict()


@router.delete("/ingredientes/{id_ingrediente}", response_model=MessageOut)
def eliminar_ingrediente(
    id_ingrediente: int, claims: dict = Depends(admin_o_cocinero), db: Session = Depends(get_db)
):
    ingrediente = db.get(Ingrediente, id_ingrediente)
    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")

    db.delete(ingrediente)
    db.commit()
    return {"message": "Ingrediente eliminado"}


# --- Recetas ---

@router.get("/recetas", response_model=list[RecetaOut])
def listar_recetas(
    id_producto: int | None = Query(default=None),
    claims: dict = Depends(get_claims),
    db: Session = Depends(get_db),
):
    query = db.query(Receta)
    if id_producto:
        query = query.filter_by(id_producto=id_producto)
    return [r.to_dict() for r in query.all()]


@router.post("/recetas", response_model=RecetaOut, status_code=201)
def crear_receta(
    data: RecetaCreate, claims: dict = Depends(admin_o_cocinero), db: Session = Depends(get_db)
):
    receta = Receta(
        id_producto=data.id_producto,
        id_ingrediente=data.id_ingrediente,
        cantidad_requerida=data.cantidad_requerida,
    )
    db.add(receta)
    db.commit()
    return receta.to_dict()


@router.delete("/recetas/{id_receta}", response_model=MessageOut)
def eliminar_receta(
    id_receta: int, claims: dict = Depends(admin_o_cocinero), db: Session = Depends(get_db)
):
    receta = db.get(Receta, id_receta)
    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    db.delete(receta)
    db.commit()
    return {"message": "Receta eliminada"}


# --- Movimientos de inventario ---

@router.get("/inventario-movimientos", response_model=list[MovimientoOut])
def listar_movimientos(
    id_ingrediente: int | None = Query(default=None),
    claims: dict = Depends(get_claims),
    db: Session = Depends(get_db),
):
    query = db.query(InventarioMovimiento)
    if id_ingrediente:
        query = query.filter_by(id_ingrediente=id_ingrediente)
    movimientos = query.order_by(InventarioMovimiento.fecha_movimiento.desc()).all()
    return [m.to_dict() for m in movimientos]


@router.post("/inventario-movimientos", response_model=MovimientoOut, status_code=201)
def crear_movimiento(
    data: MovimientoCreate, claims: dict = Depends(admin_o_cocinero), db: Session = Depends(get_db)
):
    if data.tipo_movimiento not in TIPOS_MOVIMIENTO:
        raise HTTPException(
            status_code=400, detail=f"tipo_movimiento debe ser uno de: {', '.join(TIPOS_MOVIMIENTO)}"
        )

    ingrediente = db.get(Ingrediente, data.id_ingrediente)
    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")

    stock_anterior = float(ingrediente.stock_actual)
    cantidad = float(data.cantidad)

    if data.tipo_movimiento == "entrada":
        stock_nuevo = stock_anterior + cantidad
    elif data.tipo_movimiento == "salida":
        stock_nuevo = stock_anterior - cantidad
    else:  # ajuste: la cantidad representa el nuevo stock absoluto
        stock_nuevo = cantidad

    ingrediente.stock_actual = stock_nuevo

    movimiento = InventarioMovimiento(
        id_ingrediente=ingrediente.id_ingrediente,
        tipo_movimiento=data.tipo_movimiento,
        cantidad=cantidad,
        stock_anterior=stock_anterior,
        stock_nuevo=stock_nuevo,
        id_usuario=claims["id"],
        referencia=data.referencia,
        observaciones=data.observaciones,
    )
    db.add(movimiento)

    if stock_nuevo < float(ingrediente.stock_minimo):
        db.add(
            AlertaStock(
                id_ingrediente=ingrediente.id_ingrediente,
                stock_actual=stock_nuevo,
                stock_minimo=ingrediente.stock_minimo,
            )
        )

    db.commit()
    return movimiento.to_dict()


# --- Alertas de stock ---

@router.get("/alertas-stock", response_model=list[AlertaOut])
def listar_alertas(
    atendida: str | None = Query(default=None),
    claims: dict = Depends(get_claims),
    db: Session = Depends(get_db),
):
    query = db.query(AlertaStock)
    if atendida is not None:
        query = query.filter_by(atendida=atendida.lower() in ("1", "true", "si"))
    alertas = query.order_by(AlertaStock.fecha_alerta.desc()).all()
    return [a.to_dict() for a in alertas]


@router.patch("/alertas-stock/{id_alerta}/atender", response_model=AlertaOut)
def atender_alerta(
    id_alerta: int, claims: dict = Depends(admin_o_cocinero), db: Session = Depends(get_db)
):
    alerta = db.get(AlertaStock, id_alerta)
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    alerta.atendida = True
    alerta.fecha_atendida = datetime.now(timezone.utc)
    db.commit()
    return alerta.to_dict()
