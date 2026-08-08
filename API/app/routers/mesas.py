from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.security import get_claims, roles_required
from ..database import get_db
from ..models.mesa import ESTADOS_MESA, Mesa
from ..schemas.common import MessageOut
from ..schemas.mesa import EstadoMesaIn, MesaCreate, MesaOut, MesaUpdate

router = APIRouter(prefix="/api/mesas", tags=["Mesas"])

solo_admin = roles_required("admin")


@router.get("", response_model=list[MesaOut])
def listar_mesas(
    estado: str | None = Query(default=None),
    claims: dict = Depends(get_claims),
    db: Session = Depends(get_db),
):
    query = db.query(Mesa)
    if estado:
        query = query.filter_by(estado=estado)
    mesas = query.order_by(Mesa.numero_mesa).all()
    return [m.to_dict() for m in mesas]


@router.get("/{id_mesa}", response_model=MesaOut)
def obtener_mesa(id_mesa: int, claims: dict = Depends(get_claims), db: Session = Depends(get_db)):
    mesa = db.get(Mesa, id_mesa)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    return mesa.to_dict()


@router.post("", response_model=MesaOut, status_code=201)
def crear_mesa(data: MesaCreate, claims: dict = Depends(solo_admin), db: Session = Depends(get_db)):
    mesa = Mesa(
        numero_mesa=data.numero_mesa,
        capacidad=data.capacidad,
        ubicacion=data.ubicacion,
        estado=data.estado,
    )
    db.add(mesa)
    db.commit()
    return mesa.to_dict()


@router.put("/{id_mesa}", response_model=MesaOut)
def actualizar_mesa(
    id_mesa: int, data: MesaUpdate, claims: dict = Depends(solo_admin), db: Session = Depends(get_db)
):
    mesa = db.get(Mesa, id_mesa)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    cambios = data.model_dump(exclude_unset=True)
    for campo in ("numero_mesa", "capacidad", "ubicacion", "estado"):
        if campo in cambios:
            setattr(mesa, campo, cambios[campo])

    db.commit()
    return mesa.to_dict()


@router.patch("/{id_mesa}/estado", response_model=MesaOut)
def cambiar_estado_mesa(
    id_mesa: int, data: EstadoMesaIn, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    mesa = db.get(Mesa, id_mesa)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    if data.estado not in ESTADOS_MESA:
        raise HTTPException(
            status_code=400, detail=f"Estado invalido. Debe ser uno de: {', '.join(ESTADOS_MESA)}"
        )

    mesa.estado = data.estado
    db.commit()
    return mesa.to_dict()


@router.delete("/{id_mesa}", response_model=MessageOut)
def eliminar_mesa(id_mesa: int, claims: dict = Depends(solo_admin), db: Session = Depends(get_db)):
    mesa = db.get(Mesa, id_mesa)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    db.delete(mesa)
    db.commit()
    return {"message": "Mesa eliminada"}
