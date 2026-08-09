/**
 * Configuracion unica de la API para toda la app movil.
 *
 * El host se resuelve solo, en este orden:
 *   1. EXPO_PUBLIC_API_HOST, si se define al levantar Expo (manda sobre todo lo demas).
 *   2. La IP del servidor de Metro. En Expo Go sobre un telefono real, esa IP es la de
 *      la computadora en la red local, que es la misma que corre la API — por eso
 *      funciona sin configurar nada. Antes se usaba 10.0.2.2 fijo en Android, que solo
 *      existe dentro del emulador: en un telefono real no apunta a ningun lado y la
 *      app decia "No fue posible conectar con el servidor".
 *   3. Los valores por plataforma, para cuando Metro corre en localhost
 *      (emulador de Android, simulador de iOS, o Expo Web).
 *
 * El telefono debe estar en la misma red WiFi que la computadora, y Windows debe
 * permitir conexiones entrantes al puerto 5001.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = 5001;

/** IP de la computadora que sirve el bundle, tal como la ve el dispositivo. */
function hostDeMetro() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (!hostUri) return null;

  const host = String(hostUri).split(':')[0];
  // Si Metro corre en localhost, esa direccion no sirve desde el dispositivo.
  return host === 'localhost' || host === '127.0.0.1' ? null : host;
}

const HOST_POR_PLATAFORMA = Platform.select({
  android: '10.0.2.2', // alias del emulador de Android hacia el localhost del host
  ios: 'localhost',
  web: 'localhost',
  default: 'localhost',
});

const API_HOST =
  process.env.EXPO_PUBLIC_API_HOST ||
  (Platform.OS === 'web' ? 'localhost' : hostDeMetro()) ||
  HOST_POR_PLATAFORMA;

export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;
