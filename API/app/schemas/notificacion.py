from pydantic import BaseModel, Field


class NotificacionCreate(BaseModel):
    tipo: str = Field(min_length=1)
    mensaje: str = Field(min_length=1)
    id_receptor: int
    id_pedido: int | None = None


class NotificacionOut(BaseModel):
    id_notificacion: int
    id_pedido: int | None
    tipo: str
    mensaje: str
    id_receptor: int
    estado: str | None
    fecha_envio: str | None
    fecha_lectura: str | None
