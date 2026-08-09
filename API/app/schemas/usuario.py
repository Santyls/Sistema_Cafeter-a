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


class PerfilUpdate(BaseModel):
    """Campos que un usuario puede editar de su propia cuenta (RF-40/41).

    No incluye 'rol' ni 'activo': cambiarlos sigue siendo exclusivo del administrador.
    """

    nombre: str | None = None
    apellido_paterno: str | None = None
    apellido_materno: str | None = None
    telefono: str | None = None
    correo: str | None = None
    contrasena: str | None = Field(default=None, min_length=6)


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
