/**
 * Configuracion unica de la API para toda la app movil.
 *
 * Para apuntar a otro servidor solo se edita API_HOST (o se define la variable
 * de entorno EXPO_PUBLIC_API_HOST al levantar Expo). Ningun otro archivo debe
 * contener direcciones IP ni puertos.
 *
 * Que valor usar en API_HOST:
 *   - Dispositivo fisico (celular real): la IP LAN de la computadora que corre
 *     la API, por ejemplo "192.168.1.7". El celular debe estar en la misma red.
 *     En Windows la IP se obtiene con: ipconfig
 *   - Emulador de Android: "10.0.2.2" (asi el emulador alcanza el localhost del host)
 *   - Simulador de iOS o Expo Web: "localhost"
 */

import { Platform } from 'react-native';

const API_PORT = 5001;

// Cambiar aqui (o exportar EXPO_PUBLIC_API_HOST antes de iniciar Expo).
const API_HOST =
  process.env.EXPO_PUBLIC_API_HOST ||
  Platform.select({
    android: '10.0.2.2',
    ios: 'localhost',
    web: 'localhost',
    default: 'localhost',
  });

export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

/**
 * Construye la URL completa de un endpoint.
 * apiUrl('/pedidos')  ->  http://<host>:5001/api/pedidos
 */
export function apiUrl(path = '') {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * fetch con la URL base y los headers JSON ya aplicados.
 * Uso: apiFetch('/pedidos', { token, method: 'POST', body: JSON.stringify(...) })
 */
export function apiFetch(path, { token, headers, ...options } = {}) {
  return fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}

export default API_BASE_URL;
