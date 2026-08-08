from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.security import get_claims
from ..database import get_db
from ..models.notificacion import Notificacion
from ..schemas.notificacion import NotificacionCreate, NotificacionOut

router = APIRouter(prefix="/api/notificaciones", tags=["Notificaciones"])


@router.get("", response_model=list[NotificacionOut])
def listar_notificaciones(
    id_receptor: int | None = Query(default=None),
    estado: str | None = Query(default=None),
    claims: dict = Depends(get_claims),
    db: Session = Depends(get_db),
):
    receptor = id_receptor or claims["id"]
    query = db.query(Notificacion).filter_by(id_receptor=receptor)
    if estado:
        query = query.filter_by(estado=estado)
    notificaciones = query.order_by(Notificacion.fecha_envio.desc()).all()
    return [n.to_dict() for n in notificaciones]


@router.post("", response_model=NotificacionOut, status_code=201)
def crear_notificacion(
    data: NotificacionCreate, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    notificacion = Notificacion(
        id_pedido=data.id_pedido,
        tipo=data.tipo,
        mensaje=data.mensaje,
        id_receptor=data.id_receptor,
    )
    db.add(notificacion)
    db.commit()
    return notificacion.to_dict()


@router.patch("/{id_notificacion}/leida", response_model=NotificacionOut)
def marcar_leida(
    id_notificacion: int, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    notificacion = db.get(Notificacion, id_notificacion)
    if not notificacion:
        raise HTTPException(status_code=404, detail="Notificacion no encontrada")

    notificacion.estado = "leida"
    notificacion.fecha_lectura = datetime.now(timezone.utc)
    db.commit()
    return notificacion.to_dict()
