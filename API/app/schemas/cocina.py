from pydantic import BaseModel, Field


class IngredienteCreate(BaseModel):
    nombre: str = Field(min_length=1)
    unidad_medida: str = Field(min_length=1)
    stock_actual: float = Field(default=0, ge=0)
    stock_minimo: float = Field(default=0, ge=0)
    activo: bool = True


class IngredienteUpdate(BaseModel):
    nombre: str | None = None
    unidad_medida: str | None = None
    stock_actual: float | None = Field(default=None, ge=0)
    stock_minimo: float | None = Field(default=None, ge=0)
    activo: bool | None = None


class IngredienteOut(BaseModel):
    id_ingrediente: int
    nombre: str
    unidad_medida: str
    stock_actual: float | None
    stock_minimo: float | None
    activo: bool | None


class RecetaCreate(BaseModel):
    id_producto: int
    id_ingrediente: int
    cantidad_requerida: float = Field(gt=0)


class RecetaOut(BaseModel):
    id_receta: int
    id_producto: int
    id_ingrediente: int
    ingrediente_nombre: str | None
    cantidad_requerida: float


class MovimientoCreate(BaseModel):
    id_ingrediente: int
    tipo_movimiento: str
    cantidad: float = Field(ge=0)
    referencia: str | None = None
    observaciones: str | None = None


class MovimientoOut(BaseModel):
    id_movimiento: int
    id_ingrediente: int
    ingrediente_nombre: str | None
    tipo_movimiento: str
    cantidad: float
    stock_anterior: float | None
    stock_nuevo: float | None
    fecha_movimiento: str | None
    id_usuario: int | None
    referencia: str | None
    observaciones: str | None


class AlertaOut(BaseModel):
    id_alerta: int
    id_ingrediente: int
    ingrediente_nombre: str | None
    stock_actual: float | None
    stock_minimo: float | None
    fecha_alerta: str | None
    atendida: bool | None
    fecha_atendida: str | None
