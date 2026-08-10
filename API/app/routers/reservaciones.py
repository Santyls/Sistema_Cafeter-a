from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.security import get_claims
from ..database import get_db
from ..models.mesa import Mesa
from ..models.pedido import Pedido
from ..models.reservacion import Reservacion
from ..schemas.reservacion import ReservacionCreate, ReservacionOut

router = APIRouter(prefix="/api/reservaciones", tags=["Reservaciones"])

# Tolerancia despues de la hora reservada antes de dar la mesa por perdida.
TOLERANCIA_MINUTOS = 15

# Una mesa se marca como reservada (y deja de aceptar pedidos nuevos) este tiempo antes.
MINUTOS_BLOQUEO = 90


def _depurar_reservaciones_vencidas(db: Session) -> None:
    """Libera las mesas de reservaciones vencidas (pasada la tolerancia) y las elimina."""
    limite = datetime.now(timezone.utc) - timedelta(minutes=TOLERANCIA_MINUTOS)

    vencidas = db.query(Reservacion).filter(Reservacion.fecha_hora < limite).all()
    if not vencidas:
        return

    for reservacion in vencidas:
        if reservacion.mesa and reservacion.mesa.estado == "reservada":
            reservacion.mesa.estado = "disponible"
        db.delete(reservacion)

    db.commit()


@router.get("", response_model=list[ReservacionOut])
def listar_reservaciones(claims: dict = Depends(get_claims), db: Session = Depends(get_db)):
    _depurar_reservaciones_vencidas(db)
    reservaciones = db.query(Reservacion).order_by(Reservacion.fecha_hora.asc()).all()
    return [r.to_dict() for r in reservaciones]


@router.post("", response_model=ReservacionOut, status_code=201)
def crear_reservacion(
    data: ReservacionCreate, claims: dict = Depends(get_claims), db: Session = Depends(get_db)
):
    mesa = db.get(Mesa, data.id_mesa)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    ahora = datetime.now(timezone.utc)
    momento = data.fecha_hora
    if momento.tzinfo is None:
        momento = momento.replace(tzinfo=timezone.utc)

    if momento <= ahora:
        raise HTTPException(status_code=400, detail="La reservacion debe ser para una fecha futura")

    if data.numero_personas > mesa.capacidad:
        raise HTTPException(
            status_code=409,
            detail=f"La mesa {mesa.numero_mesa} tiene capacidad para {mesa.capacidad} personas",
        )

    # Dos reservaciones de la misma mesa no pueden traslaparse dentro de la ventana de
    # bloqueo: si una empieza a las 14:00, la mesa no se puede volver a reservar entre
    # las 12:30 y las 15:30.
    ventana = timedelta(minutes=MINUTOS_BLOQUEO)
    traslape = (
        db.query(Reservacion)
        .filter(
            Reservacion.id_mesa == mesa.id_mesa,
            Reservacion.fecha_hora > momento - ventana,
            Reservacion.fecha_hora < momento + ventana,
        )
        .first()
    )
    if traslape:
        raise HTTPException(
            status_code=409,
            detail=(
                f"La mesa {mesa.numero_mesa} ya tiene una reservacion cercana "
                f"({traslape.fecha_hora.astimezone().strftime('%d/%m/%Y %H:%M')})"
            ),
        )

    reservacion = Reservacion(
        nombre_cliente=data.nombre_cliente,
        telefono=data.telefono,
        numero_personas=data.numero_personas,
        id_mesa=mesa.id_mesa,
        fecha_hora=momento,
    )

    # La mesa solo se marca reservada cuando la reservacion ya esta dentro de la ventana;
    # antes de eso sigue disponible para atender clientes.
    if momento - ahora <= ventana and mesa.estado == "disponible":
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
    mesa = reservacion.mesa
    db.delete(reservacion)
    db.flush()

    # Solo se libera si no queda otra reservacion cercana ni un pedido activo en la mesa.
    if mesa and mesa.estado == "reservada":
        ventana = datetime.now(timezone.utc) + timedelta(minutes=MINUTOS_BLOQUEO)
        otra_cercana = (
            db.query(Reservacion)
            .filter(Reservacion.id_mesa == mesa.id_mesa, Reservacion.fecha_hora <= ventana)
            .count()
        )
        pedidos_activos = (
            db.query(Pedido)
            .filter(
                Pedido.id_mesa == mesa.id_mesa,
                Pedido.estado.in_(("pendiente", "en_cocina", "en_preparacion", "listo")),
            )
            .count()
        )
        if otra_cercana == 0:
            mesa.estado = "ocupada" if pedidos_activos else "disponible"

    db.commit()
    return datos
