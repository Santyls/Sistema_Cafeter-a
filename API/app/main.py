from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import models  # noqa: F401  (registra los modelos en el metadata)
from .config import settings
from .database import Base, engine
from .routers import (
    auth,
    caja,
    cocina,
    mesas,
    notificaciones,
    pedidos,
    productos,
    reservaciones,
    usuarios,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crea las tablas si no existen (en produccion se recomienda usar Alembic).
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="CoffeeFlow API",
    description=(
        "API del sistema de cafeteria CoffeeFlow: autenticacion, usuarios, mesas, "
        "productos, pedidos, cocina/inventario, caja y notificaciones."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Manejadores de error: conservan el formato {"error": "..."} que consumen WEB y movil ---

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"error": detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    primer_error = exc.errors()[0] if exc.errors() else {}
    campo = ".".join(str(p) for p in primer_error.get("loc", []) if p not in ("body", "query", "path"))
    mensaje = primer_error.get("msg", "Datos invalidos")
    # Los errores de model_validator llegan con prefijo "Value error, "
    mensaje = mensaje.replace("Value error, ", "")
    detalle = f"{campo}: {mensaje}" if campo else mensaje
    return JSONResponse(status_code=400, content={"error": f"Datos invalidos - {detalle}"})


@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=409,
        content={
            "error": "No se puede completar la operacion: el registro esta relacionado con otros datos o duplica un valor unico"
        },
    )


# --- Routers ---

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(mesas.router)
app.include_router(productos.router)
app.include_router(pedidos.router)
app.include_router(cocina.router)
app.include_router(caja.router)
app.include_router(notificaciones.router)
app.include_router(reservaciones.router)


@app.get("/api/health", tags=["Utilidad"])
def health():
    return {"status": "ok"}
