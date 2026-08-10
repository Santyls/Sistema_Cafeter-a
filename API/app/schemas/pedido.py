from pydantic import BaseModel, Field


class DetalleIn(BaseModel):
    id_producto: int
    cantidad: int = Field(default=1, ge=1)
    observaciones: str | None = None


class PedidoCreate(BaseModel):
    # id_mesa solo se exige cuando tipo_pedido es "mesa"; un pedido para llevar no ocupa mesa.
    id_mesa: int | None = None
    tipo_pedido: str = "mesa"
    detalles: list[DetalleIn] = Field(min_length=1)
    observaciones: str | None = None
    metodo_pago: str | None = None


class ProductoCantidadIn(BaseModel):
    id_producto: int
    cantidad: int = Field(default=1, ge=1)


class DisponibilidadIn(BaseModel):
    detalles: list[ProductoCantidadIn] = Field(min_length=1)


class FaltanteOut(BaseModel):
    ingrediente: str
    unidad: str
    requerido: float
    disponible: float
    falta: float
    productos: list[str]


class DisponibilidadOut(BaseModel):
    disponible: bool
    faltantes: list[FaltanteOut]


class PedidoUpdate(BaseModel):
    observaciones: str | None = None
    metodo_pago: str | None = None
    detalles: list[DetalleIn] | None = Field(default=None, min_length=1)


class EstadoPedidoIn(BaseModel):
    estado: str
    comentario: str | None = None


class CancelarDetalleIn(BaseModel):
    # El motivo es obligatorio: cocina debe decir por que no va a preparar ese producto.
    motivo: str = Field(min_length=3)


class InyeccionIn(BaseModel):
    comentario: str | None = None


class DetalleOut(BaseModel):
    id_detalle: int
    id_pedido: int
    id_producto: int
    producto_nombre: str | None
    cantidad: int
    precio_unitario: float
    subtotal: float
    observaciones: str | None
    cancelado: bool
    motivo_cancelacion: str | None
    fecha_cancelacion: str | None


class HistorialOut(BaseModel):
    id_historial: int
    id_pedido: int
    estado_anterior: str | None
    estado_nuevo: str
    fecha_cambio: str | None
    id_usuario: int | None
    comentario: str | None


class PedidoOut(BaseModel):
    id_pedido: int
    numero_pedido: str | None
    id_mesa: int | None
    mesa_numero: int | None
    tipo_pedido: str
    id_usuario: int
    usuario_nombre: str | None
    fecha_creacion: str | None
    fecha_actualizacion: str | None
    estado: str | None
    total: float | None
    metodo_pago: str | None
    observaciones: str | None
    cuenta_solicitada: bool
    fecha_cuenta_solicitada: str | None
    pagado: bool


class PedidoConDetallesOut(PedidoOut):
    detalles: list[DetalleOut]


class PedidoCompletoOut(PedidoConDetallesOut):
    historial: list[HistorialOut]
