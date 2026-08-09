const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 10 digitos, con o sin espacios/guiones: es lo que se captura en Mexico.
const TELEFONO_REGEX = /^\d{10}$/;

export function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value || '').trim());
}

export function isEmpty(value) {
  return !String(value || '').trim();
}

export function isValidTelefono(value) {
  return TELEFONO_REGEX.test(String(value || '').replace(/[\s-]/g, ''));
}

/** Monto de dinero valido: numero positivo con hasta dos decimales. */
export function isValidMonto(value) {
  const numero = Number(String(value || '').trim());
  return Number.isFinite(numero) && numero >= 0;
}
