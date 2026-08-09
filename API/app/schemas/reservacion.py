from pydantic import BaseModel, Field


class ReservacionCreate(BaseModel):
    nombre_cliente: str = Field(min_length=1)
    telefono: str = Field(min_length=1)
    id_mesa: int
    fecha: str = Field(min_length=1, description="Formato YYYY/MM/DD")
    hora: str = Field(min_length=1, description="Formato HH:MM")


class ReservacionOut(BaseModel):
    id_reservacion: int
    nombre_cliente: str
    telefono: str
    id_mesa: int
    mesa_numero: int | None
    fecha: str
    hora: str
    fecha_creacion: str | None
