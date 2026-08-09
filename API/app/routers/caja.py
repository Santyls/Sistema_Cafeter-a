import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.email import construir_html_ticket, enviar_ticket_por_correo
from ..core.security import roles_required
from ..database import get_db
from ..models.caja import Caja, CompraSuministro, CorteCaja, Gasto, Pago, Ticket
from ..schemas.caja import (
    CajaCreate,
    CajaOut,
    CompraCreate,
    CompraOut,
    CorteCreate,
    CorteOut,
    EnviarTicketIn,
    GastoCreate,
    GastoOut,
    PagoCreate,
    PagoOut,
    TicketConPagosOut,
    TicketCreate,
    TicketOut,
)
from ..schemas.common import MessageOut

router = APIRouter(prefix="/api", tags=["Caja"])

admin_o_cajero = roles_required("admin", "cajero")


def _generar_folio():
    return f"TCK-{uuid.uuid4().hex[:8].upper()}"


# --- Turnos de caja ---

@router.get("/caja", response_model=list[CajaOut])
def listar_cajas(
    estado: str | None = Query(default=None),
    claims: dict = Depends(admin_o_cajero),
    db: Session = Depends(get_db),
):
    query = db.query(Caja)
    if estado:
        query = query.filter_by(estado=estado)
    return [c.to_dict() for c in query.order_by(Caja.fecha_apertura.desc()).all()]


@router.get("/caja/{id_caja}", response_model=CajaOut)
def obtener_caja(id_caja: int, claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    caja = db.get(Caja, id_caja)
    if not caja:
        raise HTTPException(status_code=404, detail="Caja no encontrada")
    return caja.to_dict()


@router.post("/caja", response_model=CajaOut, status_code=201)
def abrir_caja(data: CajaCreate, claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    caja = Caja(
        id_usuario=claims["id"],
        fondo_inicial=data.fondo_inicial,
        observaciones=data.observaciones,
    )
    db.add(caja)
    db.commit()
    return caja.to_dict()


@router.patch("/caja/{id_caja}/cerrar", response_model=CajaOut)
def cerrar_caja(id_caja: int, claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    caja = db.get(Caja, id_caja)
    if not caja:
        raise HTTPException(status_code=404, detail="Caja no encontrada")
    if caja.estado == "cerrado":
        raise HTTPException(status_code=409, detail="Esta caja ya esta cerrada")

    caja.estado = "cerrado"
    caja.fecha_cierre = datetime.now(timezone.utc)
    db.commit()
    return caja.to_dict()


# --- Tickets ---

@router.get("/tickets", response_model=list[TicketOut])
def listar_tickets(
    estado: str | None = Query(default=None),
    id_caja: int | None = Query(default=None),
    claims: dict = Depends(admin_o_cajero),
    db: Session = Depends(get_db),
):
    query = db.query(Ticket)
    if estado:
        query = query.filter_by(estado=estado)
    if id_caja:
        query = query.filter_by(id_caja=id_caja)
    return [t.to_dict() for t in query.order_by(Ticket.fecha.desc()).all()]


@router.get("/tickets/{id_ticket}", response_model=TicketConPagosOut)
def obtener_ticket(id_ticket: int, claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    ticket = db.get(Ticket, id_ticket)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    return ticket.to_dict(with_pagos=True)


@router.post("/caja/enviar-ticket", response_model=MessageOut)
def enviar_ticket(
    data: EnviarTicketIn, claims: dict = Depends(admin_o_cajero)
):
    """Envia el comprobante digital al correo del cliente (RF-C11)."""
    html = construir_html_ticket(
        folio=data.folio,
        mesa=data.mesa,
        total=data.total,
        metodo_pago=data.metodoPago,
        items=data.pedido,
    )
    entregado = enviar_ticket_por_correo(destinatario=data.email, folio=data.folio, html=html)

    if entregado:
        return {"message": "Ticket enviado con exito por correo electronico."}
    return {"message": "Ticket generado. No hay servidor de correo configurado, no se envio."}


@router.post("/tickets", response_model=TicketOut, status_code=201)
def crear_ticket(data: TicketCreate, claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    caja = db.get(Caja, data.id_caja)
    if not caja or caja.estado != "abierto":
        raise HTTPException(status_code=400, detail="La caja indicada no existe o no esta abierta")

    ticket = Ticket(
        folio=_generar_folio(),
        id_pedido=data.id_pedido,
        id_caja=data.id_caja,
        id_usuario=claims["id"],
        total=data.total,
        impuesto=data.impuesto,
        descuento=data.descuento,
    )
    db.add(ticket)
    db.commit()
    return ticket.to_dict()


# --- Pagos ---

@router.post("/pagos", response_model=PagoOut, status_code=201)
def registrar_pago(data: PagoCreate, claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    ticket = db.get(Ticket, data.id_ticket)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    if ticket.estado == "pagado":
        raise HTTPException(status_code=409, detail="Este ticket ya fue pagado")

    total_pagado_previo = sum(float(p.monto) for p in ticket.pagos)

    pago = Pago(
        id_ticket=ticket.id_ticket,
        monto=data.monto,
        tipo_pago=data.tipo_pago,
        referencia=data.referencia,
        cambio=data.cambio,
    )
    db.add(pago)

    if total_pagado_previo + float(data.monto) >= float(ticket.total):
        ticket.estado = "pagado"

    db.commit()
    return pago.to_dict()


# --- Cortes de caja ---

@router.get("/cortes-caja", response_model=list[CorteOut])
def listar_cortes(claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    cortes = db.query(CorteCaja).order_by(CorteCaja.fecha_corte.desc()).all()
    return [c.to_dict() for c in cortes]


@router.post("/cortes-caja", response_model=CorteOut, status_code=201)
def crear_corte(data: CorteCreate, claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    caja = db.get(Caja, data.id_caja)
    if not caja:
        raise HTTPException(status_code=404, detail="Caja no encontrada")

    tickets_pagados = db.query(Ticket).filter_by(id_caja=caja.id_caja, estado="pagado").all()
    total_efectivo = total_tarjeta = total_transferencia = 0.0
    for ticket in tickets_pagados:
        for pago in ticket.pagos:
            if pago.tipo_pago == "efectivo":
                total_efectivo += float(pago.monto)
            elif pago.tipo_pago == "tarjeta":
                total_tarjeta += float(pago.monto)
            elif pago.tipo_pago == "transferencia":
                total_transferencia += float(pago.monto)

    total_ventas = total_efectivo + total_tarjeta + total_transferencia

    corte = CorteCaja(
        id_caja=caja.id_caja,
        id_usuario=claims["id"],
        total_ventas=total_ventas,
        total_efectivo=total_efectivo,
        total_tarjeta=total_tarjeta,
        total_transferencia=total_transferencia,
        diferencia=data.diferencia,
    )
    db.add(corte)
    db.commit()
    return corte.to_dict()


# --- Gastos ---

@router.get("/gastos", response_model=list[GastoOut])
def listar_gastos(claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    gastos = db.query(Gasto).order_by(Gasto.fecha.desc()).all()
    return [g.to_dict() for g in gastos]


@router.post("/gastos", response_model=GastoOut, status_code=201)
def crear_gasto(data: GastoCreate, claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    gasto = Gasto(
        id_caja=data.id_caja,
        id_usuario=claims["id"],
        concepto=data.concepto,
        monto=data.monto,
        categoria=data.categoria,
        comprobante=data.comprobante,
    )
    db.add(gasto)
    db.commit()
    return gasto.to_dict()


# --- Compras de suministro ---

@router.get("/compras-suministro", response_model=list[CompraOut])
def listar_compras(claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    compras = db.query(CompraSuministro).order_by(CompraSuministro.fecha.desc()).all()
    return [c.to_dict() for c in compras]


@router.post("/compras-suministro", response_model=CompraOut, status_code=201)
def crear_compra(data: CompraCreate, claims: dict = Depends(admin_o_cajero), db: Session = Depends(get_db)):
    compra = CompraSuministro(
        id_caja=data.id_caja,
        id_usuario=claims["id"],
        proveedor=data.proveedor,
        total=data.total,
        estado=data.estado,
        factura=data.factura,
        notas=data.notas,
    )
    db.add(compra)
    db.commit()
    return compra.to_dict()
