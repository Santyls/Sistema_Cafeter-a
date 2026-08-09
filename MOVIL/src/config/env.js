/**
 * Configuracion unica de la API para toda la app movil.
 *
 * Para apuntar a otro servidor solo se edita API_HOST (o se define la variable de
 * entorno EXPO_PUBLIC_API_HOST al levantar Expo). Ningun otro archivo debe contener
 * direcciones IP ni puertos.
 *
 * Que valor usar en API_HOST:
 *   - Dispositivo fisico: la IP LAN de la computadora que corre la API (ipconfig en
 *     Windows). El celular debe estar en la misma red.
 *   - Emulador de Android: "10.0.2.2"
 *   - Simulador de iOS o Expo Web: "localhost"
 */

import { Platform } from 'react-native';

const API_PORT = 5001;

const API_HOST =
  process.env.EXPO_PUBLIC_API_HOST ||
  Platform.select({
    android: '10.0.2.2',
    ios: 'localhost',
    web: 'localhost',
    default: 'localhost',
  });

export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;
