import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CarritoContext = createContext(null);

/**
 * Carrito por mesa. Vive en memoria mientras el mesero arma el pedido y se vacia al
 * enviarlo a caja. Se guarda por mesa para que atender otra mesa a medias no borre
 * lo que ya se llevaba capturado en la primera.
 */
export function CarritoProvider({ children }) {
  const [carritos, setCarritos] = useState({});

  const agregar = useCallback((idMesa, producto, cantidad = 1, observaciones = '') => {
    setCarritos((prev) => {
      const actual = prev[idMesa] || [];
      // Dos veces el mismo producto con la misma nota es la misma linea, no dos.
      const existente = actual.findIndex(
        (i) => i.producto.id_producto === producto.id_producto && i.observaciones === observaciones
      );

      const siguiente =
        existente >= 0
          ? actual.map((i, idx) => (idx === existente ? { ...i, cantidad: i.cantidad + cantidad } : i))
          : [...actual, { producto, cantidad, observaciones }];

      return { ...prev, [idMesa]: siguiente };
    });
  }, []);

  const cambiarCantidad = useCallback((idMesa, indice, cantidad) => {
    setCarritos((prev) => {
      const actual = prev[idMesa] || [];
      const siguiente =
        cantidad <= 0
          ? actual.filter((_, i) => i !== indice)
          : actual.map((item, i) => (i === indice ? { ...item, cantidad } : item));
      return { ...prev, [idMesa]: siguiente };
    });
  }, []);

  const vaciar = useCallback((idMesa) => {
    setCarritos((prev) => ({ ...prev, [idMesa]: [] }));
  }, []);

  const value = useMemo(
    () => ({
      carritos,
      itemsDe: (idMesa) => carritos[idMesa] || [],
      totalDe: (idMesa) =>
        (carritos[idMesa] || []).reduce(
          (acc, i) => acc + Number(i.producto.precio) * i.cantidad,
          0
        ),
      piezasDe: (idMesa) => (carritos[idMesa] || []).reduce((acc, i) => acc + i.cantidad, 0),
      agregar,
      cambiarCantidad,
      vaciar,
    }),
    [carritos, agregar, cambiarCantidad, vaciar]
  );

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  return ctx;
}
