/**
 * Ciclo de vida del pedido, tal como lo guarda la API. Tenerlo en un solo lugar evita
 * que cada pantalla invente su propio nombre para el mismo estado.
 */
export const ESTADOS = {
  pendiente: { label: 'En caja', tone: 'warning', paso: 0 },
  en_cocina: { label: 'En cocina', tone: 'accent', paso: 1 },
  en_preparacion: { label: 'En preparación', tone: 'accent', paso: 2 },
  listo: { label: 'Listo para entregar', tone: 'success', paso: 3 },
  entregado: { label: 'Entregado', tone: 'success', paso: 4 },
  cancelado: { label: 'Cancelado', tone: 'danger', paso: -1 },
};

/** Los pasos que recorre un pedido, para la barra de progreso del seguimiento. */
export const PASOS = [
  { estado: 'pendiente', label: 'En caja' },
  { estado: 'en_cocina', label: 'En cocina' },
  { estado: 'en_preparacion', label: 'Preparando' },
  { estado: 'listo', label: 'Listo' },
  { estado: 'entregado', label: 'Entregado' },
];

export function etiquetaEstado(estado) {
  return ESTADOS[estado]?.label || estado || 'Sin estado';
}

export function tonoEstado(estado) {
  return ESTADOS[estado]?.tone || 'textSecondary';
}

export function pasoDeEstado(estado) {
  return ESTADOS[estado]?.paso ?? 0;
}

/** Estados en los que el pedido sigue vivo. */
export const ESTADOS_ACTIVOS = ['pendiente', 'en_cocina', 'en_preparacion', 'listo'];

/** Estados que ya salieron del flujo de trabajo. */
export const ESTADOS_CERRADOS = ['entregado', 'cancelado'];

/** Lo que cocina tiene por hacer. */
export const ESTADOS_ACTIVOS_COCINA = ['en_cocina', 'en_preparacion', 'listo'];

/** Origen del pedido: mesa o mostrador. */
export function origenDePedido(pedido) {
  if (!pedido) return '';
  return pedido.tipo_pedido === 'para_llevar' ? 'Para llevar' : `Mesa ${pedido.mesa_numero}`;
}

/**
 * Los pedidos finalizados se dejan de mostrar despues de este tiempo. El registro
 * sigue en la base de datos para las estadisticas del panel web; solo desaparece de
 * la vista del personal para que no se llene de historia vieja.
 */
export const DIAS_VISIBLES_FINALIZADOS = 30;

export function dentroDeVentanaVisible(fecha) {
  if (!fecha) return false;
  const limite = Date.now() - DIAS_VISIBLES_FINALIZADOS * 24 * 60 * 60 * 1000;
  return new Date(fecha).getTime() >= limite;
}
