"""Autenticacion JWT y control de acceso por roles."""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models.usuario import Usuario

bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(user: Usuario) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id_usuario),
        "rol": user.rol,
        "iat": now,
        "exp": now + timedelta(minutes=settings.JWT_EXPIRES_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def get_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Valida el token Bearer y devuelve los claims {id, rol}."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="No autorizado: falta el token de acceso")
    try:
        payload = jwt.decode(
            credentials.credentials, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="El token ha expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalido")
    return {"id": int(payload["sub"]), "rol": payload.get("rol")}


def roles_required(*roles: str):
    """Dependencia que restringe el acceso a los roles indicados."""

    def checker(claims: dict = Depends(get_claims)) -> dict:
        if claims.get("rol") not in roles:
            raise HTTPException(status_code=403, detail="No tienes permisos para esta accion")
        return claims

    return checker


def get_current_user(
    claims: dict = Depends(get_claims), db: Session = Depends(get_db)
) -> Usuario:
    user = db.get(Usuario, claims["id"])
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
