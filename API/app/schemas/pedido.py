from pydantic import BaseModel, Field


class DetalleIn(BaseModel):
    id_producto: int
    cantidad: int = Field(default=1, ge=1)
    observaciones: str | None = None


class PedidoCreate(BaseModel):
    id_mesa: int
    detalles: list[DetalleIn] = Field(min_length=1)
    observaciones: str | None = None
    metodo_pago: str | None = None


class PedidoUpdate(BaseModel):
    observaciones: str | None = None
    metodo_pago: str | None = None
    detalles: list[DetalleIn] | None = Field(default=None, min_length=1)


class EstadoPedidoIn(BaseModel):
    estado: str
    comentario: str | None = None


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
    id_mesa: int
    mesa_numero: int | None
    id_usuario: int
    usuario_nombre: str | None
    fecha_creacion: str | None
    fecha_actualizacion: str | None
    estado: str | None
    total: float | None
    metodo_pago: str | None
    observaciones: str | None


class PedidoConDetallesOut(PedidoOut):
    detalles: list[DetalleOut]


class PedidoCompletoOut(PedidoConDetallesOut):
    historial: list[HistorialOut]
