from pydantic import BaseModel, Field


class CajaCreate(BaseModel):
    fondo_inicial: float = Field(default=0, ge=0)
    observaciones: str | None = None


class CajaOut(BaseModel):
    id_caja: int
    id_usuario: int
    fecha_apertura: str | None
    fecha_cierre: str | None
    fondo_inicial: float | None
    estado: str | None
    observaciones: str | None


class TicketCreate(BaseModel):
    id_caja: int
    total: float = Field(ge=0)
    id_pedido: int | None = None
    impuesto: float = Field(default=0, ge=0)
    descuento: float = Field(default=0, ge=0)


class PagoOut(BaseModel):
    id_pago: int
    id_ticket: int
    monto: float
    tipo_pago: str
    referencia: str | None
    fecha_pago: str | None
    cambio: float | None


class TicketOut(BaseModel):
    id_ticket: int
    folio: str | None
    id_pedido: int | None
    id_caja: int
    id_usuario: int
    fecha: str | None
    total: float
    impuesto: float | None
    descuento: float | None
    estado: str | None


class TicketConPagosOut(TicketOut):
    pagos: list[PagoOut]


class PagoCreate(BaseModel):
    id_ticket: int
    monto: float = Field(gt=0)
    tipo_pago: str = Field(min_length=1)
    referencia: str | None = None
    cambio: float = Field(default=0, ge=0)


class CorteCreate(BaseModel):
    id_caja: int
    diferencia: float = 0


class CorteOut(BaseModel):
    id_corte: int
    id_caja: int
    id_usuario: int
    fecha_corte: str | None
    total_ventas: float
    total_efectivo: float
    total_tarjeta: float
    total_transferencia: float
    diferencia: float


class GastoCreate(BaseModel):
    concepto: str = Field(min_length=1)
    monto: float = Field(gt=0)
    id_caja: int | None = None
    categoria: str | None = None
    comprobante: str | None = None


class GastoOut(BaseModel):
    id_gasto: int
    id_caja: int | None
    id_usuario: int
    concepto: str
    monto: float
    categoria: str | None
    fecha: str | None
    comprobante: str | None


class CompraCreate(BaseModel):
    total: float = Field(gt=0)
    id_caja: int | None = None
    proveedor: str | None = None
    estado: str = "pendiente"
    factura: str | None = None
    notas: str | None = None


class CompraOut(BaseModel):
    id_compra: int
    id_caja: int | None
    id_usuario: int
    proveedor: str | None
    total: float
    fecha: str | None
    estado: str | None
    factura: str | None
    notas: str | None
