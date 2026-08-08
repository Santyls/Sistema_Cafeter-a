from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.security import create_access_token, get_claims, get_current_user
from ..database import get_db
from ..models.usuario import Usuario
from ..schemas.auth import LoginIn, LoginOut, RecuperarPasswordIn
from ..schemas.common import MessageOut
from ..schemas.usuario import UsuarioOut

router = APIRouter(prefix="/api/auth", tags=["Autenticacion"])


@router.post("/login", response_model=LoginOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    identificador = data.usuario or data.correo

    user = (
        db.query(Usuario)
        .filter((Usuario.usuario == identificador) | (Usuario.correo == identificador))
        .first()
    )

    if not user or not user.activo or not user.check_password(data.contrasena):
        raise HTTPException(status_code=401, detail="Credenciales invalidas")

    token = create_access_token(user)
    return {"access_token": token, "usuario": user.to_dict()}


@router.post("/logout", response_model=MessageOut)
def logout(claims: dict = Depends(get_claims)):
    return {"message": "Sesion cerrada"}


@router.get("/me", response_model=UsuarioOut)
def me(user: Usuario = Depends(get_current_user)):
    return user.to_dict()


@router.post("/recuperar-password", response_model=MessageOut)
def recuperar_password(data: RecuperarPasswordIn):
    # No se revela si el correo existe o no, por seguridad.
    return {"message": "Si el correo existe, se enviaran instrucciones de recuperacion"}
