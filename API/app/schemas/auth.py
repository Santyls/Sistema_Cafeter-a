from pydantic import BaseModel, Field, model_validator

from .usuario import UsuarioOut


class LoginIn(BaseModel):
    usuario: str | None = None
    correo: str | None = None
    contrasena: str = Field(min_length=1)

    @model_validator(mode="after")
    def _requiere_identificador(self):
        if not self.usuario and not self.correo:
            raise ValueError("usuario/correo y contrasena son requeridos")
        return self


class LoginOut(BaseModel):
    access_token: str
    usuario: UsuarioOut


class RecuperarPasswordIn(BaseModel):
    correo: str = Field(min_length=1)
