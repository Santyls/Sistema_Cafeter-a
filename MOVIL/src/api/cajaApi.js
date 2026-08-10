import { httpClient } from './httpClient';

/** Convierte {estado:'abierto'} en "?estado=abierto", omitiendo lo que venga vacio. */
function query(params = {}) {
  const partes = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return partes ? `?${partes}` : '';
}

export const cajaApi = {
  // Los parametros SI se mandan: antes se ignoraban y la pantalla de caja recibia
  // todos los turnos, incluidos los cerrados. Tomaba el primero del cajero (el mas
  // reciente, normalmente ya cerrado), creia que habia turno abierto y al cobrar
  // mandaba el id de una caja cerrada, que la API rechazaba.
  listar: (params) => httpClient.get(`/caja${query(params)}`),

  obtener: (id) => httpClient.get(`/caja/${id}`),

  abrir: (fondoInicial, observaciones) =>
    httpClient.post('/caja', { fondo_inicial: fondoInicial, observaciones }),

  cerrar: (id, montoFinal) => httpClient.patch(`/caja/${id}/cerrar`, { monto_final: montoFinal }),

  tickets: (params) => httpClient.get(`/tickets${query(params)}`),

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
