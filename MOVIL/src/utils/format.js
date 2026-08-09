/** Formatos compartidos, para que un precio o una hora se vean igual en toda la app. */

export function moneda(valor) {
  const numero = Number(valor) || 0;
  return `$${numero.toFixed(2)}`;
}

export function fechaCorta(fecha) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function hora(fecha) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

/** Fecha del dia en formato YYYY-MM-DD local, que es como la manda la API. */
export function hoyISO() {
  return new Date().toLocaleDateString('sv-SE');
}

/** "Hace 5 min", para listas de notificaciones y actividad reciente. */
export function tiempoRelativo(fecha) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return '';

  const minutos = Math.floor((Date.now() - d.getTime()) / 60000);
  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'Ayer' : `Hace ${dias} dias`;
}

export function iniciales(nombreCompleto, respaldo = '--') {
  const partes = String(nombreCompleto || '').split(' ').filter(Boolean);
  if (partes.length === 0) return respaldo;
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}
