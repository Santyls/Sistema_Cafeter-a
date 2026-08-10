import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ApiError } from '../api/httpClient';

/**
 * Carga datos de la API cubriendo siempre los tres estados (cargando / error / datos)
 * y los recarga al volver a la pantalla. Sin el useFocusEffect, cambiar de tab no
 * remonta la pantalla y los datos se quedaban viejos: por ejemplo cocina marcaba un
 * pedido listo y el mesero seguia viendolo en preparacion.
 *
 * Uso: const { datos, cargando, error, recargar } = useCarga(pedidosApi.listar, []);
 */
export default function useCarga(cargar, valorInicial = null, deps = []) {
  const [datos, setDatos] = useState(valorInicial);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const ejecutar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setDatos(await cargar());
    } catch (e) {
      console.log('Error al cargar:', e);
      setError(
        e instanceof ApiError
          ? `${e.message} Toca para reintentar.`
          : 'No fue posible cargar la información. Toca para reintentar.'
      );
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      ejecutar();
    }, [ejecutar])
  );

  return { datos, setDatos, cargando, error, recargar: ejecutar };
}
