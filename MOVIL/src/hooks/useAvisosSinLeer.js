import { useCallback, useEffect, useRef, useState } from 'react';
import { notificacionesApi } from '../api/notificacionesApi';
import { mostrarMensaje } from '../utils/alerts';

// Cada cuanto se revisa si llego algo nuevo. La cafeteria trabaja con tiempos de
// minutos, no de segundos: consultar mas seguido solo gasta bateria y red.
const INTERVALO_MS = 15000;

/**
 * Cuenta los avisos sin leer y avisa cuando llega uno nuevo.
 *
 * Antes las notificaciones existian pero nadie se enteraba: solo se veian entrando a
 * la pantalla de notificaciones. Con esto el icono de la campana lleva su contador y
 * el usuario recibe un aviso en el momento, que es lo que hace que cocina se entere de
 * un pedido nuevo sin estar revisando.
 */
export default function useAvisosSinLeer({ avisarNuevos = false } = {}) {
  const [sinLeer, setSinLeer] = useState(0);
  // Ids ya vistos: sirve para distinguir "hay 3 sin leer" de "acaba de llegar uno".
  const conocidos = useRef(null);

  const revisar = useCallback(async () => {
    try {
      const lista = await notificacionesApi.listar();
      const pendientes = lista.filter((n) => n.estado !== 'leida');
      setSinLeer(pendientes.length);

      const ids = new Set(pendientes.map((n) => n.id_notificacion));

      // La primera consulta solo toma la foto inicial: si no, al entrar a la app
      // saldrian de golpe avisos viejos como si acabaran de llegar.
      if (conocidos.current === null) {
        conocidos.current = ids;
        return;
      }

      const nuevos = pendientes.filter((n) => !conocidos.current.has(n.id_notificacion));
      conocidos.current = ids;

      if (avisarNuevos && nuevos.length > 0) {
        const mensaje =
          nuevos.length === 1
            ? nuevos[0].mensaje
            : `Tienes ${nuevos.length} avisos nuevos. Revisalos en notificaciones.`;
        mostrarMensaje('Nueva notificación', mensaje);
      }
    } catch {
      // Un fallo de red aqui no debe interrumpir al usuario: se reintenta solo.
    }
  }, [avisarNuevos]);

  useEffect(() => {
    revisar();
    const intervalo = setInterval(revisar, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [revisar]);

  return { sinLeer, revisar };
}
