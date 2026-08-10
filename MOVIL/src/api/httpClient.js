import { API_BASE_URL } from '../config/env';
import { tokenStorage } from './tokenStorage';

const TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// AuthContext se registra aqui al montar. httpClient no puede importar el contexto de
// React directamente (crearia un ciclo), asi que usa este callback para avisar "la
// sesión ya no sirve" — sin esto el usuario se queda en una pantalla autenticada
// viendo errores en vez de volver al login.
let onSessionExpired = null;
export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}

// El detail de FastAPI llega como string (errores de negocio) o como lista de
// {loc, msg} (errores de validacion de Pydantic). La API tambien conserva el formato
// legado {"error": "..."} en algunos endpoints. Se normaliza todo a un texto legible.
function mensajeDeError(cuerpo) {
  if (!cuerpo) return null;
  if (typeof cuerpo.error === 'string') return cuerpo.error;

  const detail = cuerpo.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const partes = detail.map((e) => e?.msg || JSON.stringify(e));
    return partes.length ? partes.join(' ') : 'Datos inválidos.';
  }
  return null;
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await tokenStorage.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Capa 3: fallas de red (WiFi, IP mal configurada, API apagada) no llegan como
  // respuesta, lanzan excepcion. El AbortController cubre el caso donde el servidor
  // ni siquiera responde: sin esto el spinner podia girar para siempre.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let respuesta;
  try {
    respuesta = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    console.log('Error de red:', error);
    throw new ApiError(
      0,
      error.name === 'AbortError'
        ? 'El servidor tardo demasiado en responder. Intenta de nuevo.'
        : 'No fue posible conectar con el servidor. Verifica tu conexion.'
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (respuesta.status === 401 && auth) {
    onSessionExpired?.();
  }

  // Capa 2: fetch NO lanza excepcion con 400/401/409 — sin este chequeo explicito la
  // app trataria cualquier respuesta como exito aunque el servidor la haya rechazado.
  if (!respuesta.ok) {
    console.log('Error del servidor:', respuesta.status, path);
    let cuerpo = null;
    try {
      cuerpo = await respuesta.json();
    } catch {
      // sin cuerpo JSON (por ejemplo un 500 crudo): se usa el mensaje generico
    }
    throw new ApiError(respuesta.status, mensajeDeError(cuerpo) || 'Ocurrio un error inesperado.');
  }

  if (respuesta.status === 204) return null;
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}

export const httpClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
