/**
 * Estados de pedido tal como los guarda la API, con su etiqueta y color.
 * Tener esto en un solo lugar evita que cada pantalla invente su propio nombre
 * ("Listo para Servir" en una, "listo" en otra) para el mismo estado.
 */
export const ESTADOS = {
  pendiente: { label: 'Pendiente', tone: 'warning' },
  en_preparacion: { label: 'En preparacion', tone: 'accent' },
  listo: { label: 'Listo', tone: 'success' },
  entregado: { label: 'Entregado', tone: 'textSecondary' },
  entregado_pagado: { label: 'Pagado', tone: 'success' },
  cancelado: { label: 'Cancelado', tone: 'danger' },
};

export function etiquetaEstado(estado) {
  return ESTADOS[estado]?.label || estado || 'Sin estado';
}

export function tonoEstado(estado) {
  return ESTADOS[estado]?.tone || 'textSecondary';
}

/** Estados que cocina ve como trabajo por hacer. */
export const ESTADOS_ACTIVOS_COCINA = ['pendiente', 'en_preparacion', 'listo'];

/** Estados que ya salieron del flujo de trabajo y van al historial. */
export const ESTADOS_CERRADOS = ['entregado', 'entregado_pagado', 'cancelado'];
