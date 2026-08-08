from pydantic import BaseModel, Field


class CategoriaCreate(BaseModel):
    nombre: str = Field(min_length=1)
    descripcion: str | None = None
    activo: bool = True


class CategoriaUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    activo: bool | None = None


class CategoriaOut(BaseModel):
    id_categoria: int
    nombre: str
    descripcion: str | None
    activo: bool | None


class ProductoCreate(BaseModel):
    nombre: str = Field(min_length=1)
    precio: float = Field(ge=0)
    descripcion: str | None = None
    imagen: str | None = None
    disponible: bool = True
    id_categoria: int | None = None


class ProductoUpdate(BaseModel):
    nombre: str | None = None
    precio: float | None = Field(default=None, ge=0)
    descripcion: str | None = None
    imagen: str | None = None
    disponible: bool | None = None
    id_categoria: int | None = None


class ProductoOut(BaseModel):
    id_producto: int
    nombre: str
    descripcion: str | None
    precio: float | None
    imagen: str | None
    disponible: bool | None
    id_categoria: int | None
