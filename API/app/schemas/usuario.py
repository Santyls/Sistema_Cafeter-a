from pydantic import BaseModel, EmailStr, Field


class UsuarioCreate(BaseModel):
    nombre: str = Field(min_length=1)
    apellido_paterno: str | None = None
    apellido_materno: str | None = None
    telefono: str | None = None
    correo: EmailStr
    usuario: str = Field(min_length=1)
    contrasena: str = Field(min_length=1)
    rol: str


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    apellido_paterno: str | None = None
    apellido_materno: str | None = None
    telefono: str | None = None
    correo: str | None = None
    usuario: str | None = None
    rol: str | None = None
    activo: bool | None = None
    contrasena: str | None = None


class UsuarioOut(BaseModel):
    id_usuario: int
    nombre: str
    apellido_paterno: str | None
    apellido_materno: str | None
    telefono: str | None
    correo: str
    usuario: str
    rol: str
    fecha_registro: str | None
    activo: bool | None
