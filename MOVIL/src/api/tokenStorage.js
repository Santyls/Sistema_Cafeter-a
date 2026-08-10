import { Platform } from 'react-native';

const CLAVE = 'coffeeflow.access_token';

/**
 * Guarda el token de la sesion.
 *
 * En web se usa sessionStorage y NO localStorage: localStorage es compartido por todas
 * las pestanas del mismo sitio, asi que abrir cocina en una pestana y caja en otra
 * hacia que la ultima en entrar se quedara con el token de las dos. La pestana vieja
 * seguia mostrando su modulo pero mandaba el token del otro rol, y la API respondia
 * cosas como "el rol 'cajero' no puede cambiar un pedido a 'en_preparacion'".
 *
 * Con sessionStorage cada pestana tiene su propia sesion, que es justo lo que hace
 * falta para probar los tres modulos a la vez, y recargar sigue sin sacar al usuario.
 *
 * En dispositivo basta con memoria: la app tiene una sola sesion a la vez.
 */
let enMemoria = null;

function almacenWeb() {
  try {
    return window.sessionStorage;
  } catch {
    return null; // modo privado o sin acceso: se queda solo en memoria
  }
}

// Las versiones anteriores guardaban el token en localStorage. Se borra al arrancar
// para que no quede una sesion compartida entre pestanas de antes de este cambio.
if (Platform.OS === 'web') {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // sin acceso a localStorage: nada que limpiar
  }
}

export const tokenStorage = {
  async getToken() {
    if (Platform.OS === 'web') {
      return almacenWeb()?.getItem(CLAVE) ?? enMemoria;
    }
    return enMemoria;
  },

  async setToken(token) {
    enMemoria = token;
    if (Platform.OS === 'web') {
      almacenWeb()?.setItem(CLAVE, token);
    }
  },

  async clearToken() {
    enMemoria = null;
    if (Platform.OS === 'web') {
      almacenWeb()?.removeItem(CLAVE);
      // Limpia el token que las versiones anteriores dejaron en localStorage, que es
      // el que causaba el cruce de sesiones entre pestanas.
      try {
        window.localStorage.removeItem(CLAVE);
      } catch {
        // sin acceso a localStorage: no hay nada que limpiar
      }
    }
  },
};
