from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.security import get_claims
from ..database import get_db
from ..models.mesa import Mesa
from ..models.reservacion import Reservacion
from ..schemas.reservacion import ReservacionCreate, ReservacionOut

router = APIRouter(prefix="/api/reservaciones", tags=["Reservaciones"])

# Zona horaria local del negocio (GMT-6) y tolerancia antes de liberar la mesa.
TZ_LOCAL = timezone(timedelta(hours=-6))
TOLERANCIA_MINUTOS = 5


def _depurar_reservaciones_vencidas(db: Session) -> None:
    """Libera las mesas de reservaciones vencidas (pasada la tolerancia) y las elimina."""
    ahora = datetime.now(TZ_LOCAL)
    hubo_cambios = False

    for reservacion in db.query(Reservacion).all():
        momento = None
        for formato in ("%Y/%m/%d %H:%M", "%Y-%m-%d %H:%M"):
            try:
                momento = datetime.strptime(f"{reservacion.fecha} {reservacion.hora}", formato)
                break
            except ValueError:
                continue
        if momento is None:
            # Formato no reconocido: se conserva la reservacion en lugar de descartarla.
            continue

        if ahora > momento.replace(tzinfo=TZ_LOCAL) + timedelta(minutes=TOLERANCIA_MINUTOS):
            if reservacion.mesa and reservacion.mesa.estado == "reservada":
                reservacion.mesa.estado = "disponible"
            db.delete(reservacion)
            hubo_cambios = True

    if hubo_cambios:
        db.commit()


@router.get("", response_model=list[ReservacionOut])
def listar_reservaciones(claims: dict = Depends(get_claims), db: Session = Depends(get_db)):
    _depurar_reservaciones_vencidas(db)
    reservaciones = db.query(Reservacion).order_by(Reservacion.fecha.desc()).all()
    return [r.to_dict() for r in reservaciones]


@router.post("", response_model=ReservacionOut, status_code=201)
def crear_reservacion(
    data: ReservacionCreate, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    mesa = db.get(Mesa, data.id_mesa)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    if mesa.estado == "ocupada":
        raise HTTPException(status_code=409, detail="La mesa esta ocupada y no puede reservarse")

    reservacion = Reservacion(
        nombre_cliente=data.nombre_cliente,
        telefono=data.telefono,
        id_mesa=data.id_mesa,
        fecha=data.fecha,
        hora=data.hora,
    )
    mesa.estado = "reservada"
    db.add(reservacion)
    db.commit()
    return reservacion.to_dict()


@router.delete("/{id_reservacion}", response_model=ReservacionOut)
def cancelar_reservacion(
    id_reservacion: int, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    reservacion = db.get(Reservacion, id_reservacion)
    if not reservacion:
        raise HTTPException(status_code=404, detail="Reservacion no encontrada")

    datos = reservacion.to_dict()
    if reservacion.mesa and reservacion.mesa.estado == "reservada":
        reservacion.mesa.estado = "disponible"
    db.delete(reservacion)
    db.commit()
    return datos
