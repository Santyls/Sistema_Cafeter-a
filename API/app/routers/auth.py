from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.security import create_access_token, get_claims, get_current_user
from ..database import get_db
from ..models.usuario import Usuario
from ..schemas.auth import LoginIn, LoginOut, RecuperarPasswordIn
from ..schemas.common import MessageOut
from ..schemas.usuario import PerfilUpdate, UsuarioOut

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


@router.put("/me", response_model=UsuarioOut)
def actualizar_mi_perfil(
    data: PerfilUpdate,
    user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permite a cualquier usuario autenticado editar sus propios datos (RF-40/41)."""
    cambios = data.model_dump(exclude_unset=True)

    nuevo_correo = cambios.get("correo")
    if nuevo_correo and nuevo_correo != user.correo:
        if db.query(Usuario).filter(Usuario.correo == nuevo_correo).first():
            raise HTTPException(status_code=409, detail="El correo ya esta registrado")

    for campo in ("nombre", "apellido_paterno", "apellido_materno", "telefono", "correo"):
        if campo in cambios:
            setattr(user, campo, cambios[campo])

    if cambios.get("contrasena"):
        user.set_password(cambios["contrasena"])

    db.commit()
    return user.to_dict()


@router.post("/recuperar-password", response_model=MessageOut)
def recuperar_password(data: RecuperarPasswordIn):
    # No se revela si el correo existe o no, por seguridad.
    return {"message": "Si el correo existe, se enviaran instrucciones de recuperacion"}
