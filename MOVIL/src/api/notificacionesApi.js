import { httpClient } from './httpClient';

export const notificacionesApi = {
  listar: () => httpClient.get('/notificaciones'),

  marcarLeida: (id) => httpClient.patch(`/notificaciones/${id}/leida`),

  crear: (notificacion) => httpClient.post('/notificaciones', notificacion),
};
