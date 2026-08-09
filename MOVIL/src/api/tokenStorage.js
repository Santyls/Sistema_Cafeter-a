import { Platform } from 'react-native';

const CLAVE = 'coffeeflow.access_token';

/**
 * Guarda el token de sesion. En web se usa localStorage porque expo-secure-store no
 * existe ahi; en dispositivo se usa el almacenamiento en memoria del proceso, que es
 * suficiente mientras la app siga abierta.
 */
let enMemoria = null;

export const tokenStorage = {
  async getToken() {
    if (Platform.OS === 'web') {
      try {
        return window.localStorage.getItem(CLAVE);
      } catch {
        return enMemoria;
      }
    }
    return enMemoria;
  },

  async setToken(token) {
    enMemoria = token;
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(CLAVE, token);
      } catch {
        // modo privado del navegador: se queda solo en memoria
      }
    }
  },

  async clearToken() {
    enMemoria = null;
    if (Platform.OS === 'web') {
      try {
        window.localStorage.removeItem(CLAVE);
      } catch {
        // sin nada que limpiar
      }
    }
  },
};
