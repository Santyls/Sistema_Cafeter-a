from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.security import roles_required
from ..database import get_db
from ..models.usuario import ROLES_VALIDOS, Usuario
from ..schemas.common import MessageOut
from ..schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])

solo_admin = roles_required("admin")


@router.get("", response_model=list[UsuarioOut])
def listar_usuarios(
    rol: str | None = Query(default=None),
    claims: dict = Depends(solo_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Usuario)
    if rol:
        query = query.filter_by(rol=rol)
    usuarios = query.order_by(Usuario.nombre).all()
    return [u.to_dict() for u in usuarios]


@router.get("/{id_usuario}", response_model=UsuarioOut)
def obtener_usuario(
    id_usuario: int, claims: dict = Depends(solo_admin), db: Session = Depends(get_db)
):
    user = db.get(Usuario, id_usuario)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user.to_dict()


@router.post("", response_model=UsuarioOut, status_code=201)
def crear_usuario(
    data: UsuarioCreate, claims: dict = Depends(solo_admin), db: Session = Depends(get_db)
):
    if data.rol not in ROLES_VALIDOS:
        raise HTTPException(
            status_code=400, detail=f"Rol invalido. Debe ser uno de: {', '.join(ROLES_VALIDOS)}"
        )

    if db.query(Usuario).filter_by(correo=data.correo).first():
        raise HTTPException(status_code=409, detail="El correo ya esta registrado")
    if db.query(Usuario).filter_by(usuario=data.usuario).first():
        raise HTTPException(status_code=409, detail="El nombre de usuario ya esta en uso")

    user = Usuario(
        nombre=data.nombre,
        apellido_paterno=data.apellido_paterno,
        apellido_materno=data.apellido_materno,
        telefono=data.telefono,
        correo=data.correo,
        usuario=data.usuario,
        rol=data.rol,
    )
    user.set_password(data.contrasena)
    db.add(user)
    db.commit()
    return user.to_dict()


@router.put("/{id_usuario}", response_model=UsuarioOut)
def actualizar_usuario(
    id_usuario: int,
    data: UsuarioUpdate,
    claims: dict = Depends(solo_admin),
    db: Session = Depends(get_db),
):
    user = db.get(Usuario, id_usuario)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    cambios = data.model_dump(exclude_unset=True)

    if "rol" in cambios and cambios["rol"] not in ROLES_VALIDOS:
        raise HTTPException(
            status_code=400, detail=f"Rol invalido. Debe ser uno de: {', '.join(ROLES_VALIDOS)}"
        )

    for campo in ("nombre", "apellido_paterno", "apellido_materno", "telefono", "correo", "usuario", "rol", "activo"):
        if campo in cambios:
            setattr(user, campo, cambios[campo])

    if cambios.get("contrasena"):
        user.set_password(cambios["contrasena"])

    db.commit()
    return user.to_dict()


@router.delete("/{id_usuario}", response_model=MessageOut)
def eliminar_usuario(
    id_usuario: int, claims: dict = Depends(solo_admin), db: Session = Depends(get_db)
):
    if id_usuario == claims["id"]:
        raise HTTPException(status_code=400, detail="Un administrador no puede eliminarse a si mismo")

    user = db.get(Usuario, id_usuario)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado"}
