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

  /** Caja valida el pedido y lo manda a cocina. */
  mandarACocina: (id) => httpClient.post(`/pedidos/${id}/inyectar`),

  /** El mesero avisa que el cliente pidio la cuenta; hasta entonces caja no cobra. */
  solicitarCuenta: (id) => httpClient.post(`/pedidos/${id}/solicitar-cuenta`),

  /** Revisa si hay ingredientes suficientes antes de mandar el pedido. */
  revisarDisponibilidad: (detalles) => httpClient.post('/pedidos/disponibilidad', { detalles }),

  cambiarEstado: (id, estado, comentario) =>
    httpClient.patch(`/pedidos/${id}/estado`, { estado, comentario }),

  /** Cancela un solo producto del pedido; el resto sigue su curso y no se cobra ese. */
  cancelarDetalle: (idPedido, idDetalle, motivo) =>
    httpClient.post(`/pedidos/${idPedido}/detalles/${idDetalle}/cancelar`, { motivo }),

  cancelar: (id, motivo) =>
    httpClient.delete(`/pedidos/${id}${motivo ? `?motivo=${encodeURIComponent(motivo)}` : ''}`),

  historial: (id) => httpClient.get(`/pedidos/${id}/historial`),
};
