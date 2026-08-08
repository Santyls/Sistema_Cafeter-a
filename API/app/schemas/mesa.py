from pydantic import BaseModel, Field


class MesaCreate(BaseModel):
    numero_mesa: int = Field(gt=0)
    capacidad: int = Field(default=4, gt=0)
    ubicacion: str | None = None
    estado: str = "disponible"


class MesaUpdate(BaseModel):
    numero_mesa: int | None = Field(default=None, gt=0)
    capacidad: int | None = Field(default=None, gt=0)
    ubicacion: str | None = None
    estado: str | None = None


class EstadoMesaIn(BaseModel):
    estado: str


class MesaOut(BaseModel):
    id_mesa: int
    numero_mesa: int
    capacidad: int | None
    ubicacion: str | None
    estado: str | None
