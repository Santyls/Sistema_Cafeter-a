import { httpClient } from './httpClient';

export const inventarioApi = {
  ingredientes: () => httpClient.get('/ingredientes'),

  alertasStock: () => httpClient.get('/alertas-stock'),

  atenderAlerta: (id) => httpClient.patch(`/alertas-stock/${id}/atender`),

  /** Entrada de inventario: reabastecer un ingrediente. */
  reabastecer: (idIngrediente, cantidad, motivo = 'Reabastecimiento desde cocina') =>
    httpClient.post('/inventario-movimientos', {
      id_ingrediente: idIngrediente,
      tipo_movimiento: 'entrada',
      cantidad,
      motivo,
    }),

  movimientos: () => httpClient.get('/inventario-movimientos'),
};
