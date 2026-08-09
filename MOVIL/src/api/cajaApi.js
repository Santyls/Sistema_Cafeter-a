import { httpClient } from './httpClient';

export const cajaApi = {
  listar: () => httpClient.get('/caja'),

  obtener: (id) => httpClient.get(`/caja/${id}`),

  abrir: (fondoInicial, observaciones) =>
    httpClient.post('/caja', { fondo_inicial: fondoInicial, observaciones }),

  cerrar: (id, montoFinal) => httpClient.patch(`/caja/${id}/cerrar`, { monto_final: montoFinal }),

  tickets: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    return httpClient.get(`/tickets${query ? `?${query}` : ''}`);
  },

  crearTicket: (ticket) => httpClient.post('/tickets', ticket),

  registrarPago: (pago) => httpClient.post('/pagos', pago),

  enviarTicketPorCorreo: (idTicket, correo) =>
    httpClient.post('/caja/enviar-ticket', { id_ticket: idTicket, correo }),

  cortes: () => httpClient.get('/cortes-caja'),

  crearCorte: (corte) => httpClient.post('/cortes-caja', corte),

  gastos: () => httpClient.get('/gastos'),

  crearGasto: (gasto) => httpClient.post('/gastos', gasto),

  compras: () => httpClient.get('/compras-suministro'),

  crearCompra: (compra) => httpClient.post('/compras-suministro', compra),
};
