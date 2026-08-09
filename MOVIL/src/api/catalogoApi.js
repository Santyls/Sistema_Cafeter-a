import { httpClient } from './httpClient';

/** Mesas, productos y categorias: lo que se consulta para armar un pedido. */
export const catalogoApi = {
  mesas: () => httpClient.get('/mesas'),

  cambiarEstadoMesa: (id, estado) => httpClient.patch(`/mesas/${id}/estado`, { estado }),

  productos: () => httpClient.get('/productos'),

  categorias: () => httpClient.get('/categorias'),

  reservaciones: () => httpClient.get('/reservaciones'),

  crearReservacion: (reservacion) => httpClient.post('/reservaciones', reservacion),

  cancelarReservacion: (id) => httpClient.delete(`/reservaciones/${id}`),
};
