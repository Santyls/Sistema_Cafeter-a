import { httpClient } from './httpClient';

export const pedidosApi = {
  listar: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    return httpClient.get(`/pedidos${query ? `?${query}` : ''}`);
  },

  obtener: (id) => httpClient.get(`/pedidos/${id}`),

  crear: (pedido) => httpClient.post('/pedidos', pedido),

  actualizar: (id, cambios) => httpClient.put(`/pedidos/${id}`, cambios),

  /** Caja valida el pedido y lo inyecta a cocina (descuenta inventario). */
  inyectar: (id) => httpClient.post(`/pedidos/${id}/inyectar`),

  cambiarEstado: (id, estado, comentario) =>
    httpClient.patch(`/pedidos/${id}/estado`, { estado, comentario }),

  cancelar: (id, motivo) =>
    httpClient.delete(`/pedidos/${id}${motivo ? `?motivo=${encodeURIComponent(motivo)}` : ''}`),

  historial: (id) => httpClient.get(`/pedidos/${id}/historial`),
};
