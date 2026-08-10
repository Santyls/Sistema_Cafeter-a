from datetime import datetime

from pydantic import BaseModel, Field


class ReservacionCreate(BaseModel):
    nombre_cliente: str = Field(min_length=1)
    telefono: str = Field(min_length=1)
    numero_personas: int = Field(default=1, ge=1)
    id_mesa: int
    # Instante completo en ISO 8601, por ejemplo "2026-08-15T14:30:00Z".
    fecha_hora: datetime


class ReservacionOut(BaseModel):
    id_reservacion: int
    nombre_cliente: str
    telefono: str
    numero_personas: int
    id_mesa: int
    mesa_numero: int | None
    fecha_hora: str | None
    fecha_creacion: str | None
