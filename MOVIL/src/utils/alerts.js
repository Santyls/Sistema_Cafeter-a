/**
 * Avisos y confirmaciones de la app.
 *
 * No se usa Alert.alert porque en react-native-web es un no-op: los mensajes de exito
 * y error simplemente no aparecen, y el equipo prueba la app en el preview web. En vez
 * de caer a window.alert (que rompe el estilo), el AlertProvider monta un modal con el
 * tema de la app y registra aqui su manejador, para que estas funciones se puedan
 * llamar tambien desde codigo que no es un componente (por ejemplo el AuthContext).
 */

let manejador = null;

export function registrarManejadorDeAvisos(fn) {
  manejador = fn;
}

export function mostrarMensaje(titulo, mensaje, onDismiss) {
  if (!manejador) {
    console.warn('AlertProvider no esta montado:', titulo, mensaje);
    onDismiss?.();
    return;
  }
  manejador({ titulo, mensaje, onDismiss });
}

/**
 * `destructivo` pinta el boton de accion en rojo. Solo debe usarse cuando la accion de
 * verdad quita algo (cancelar un pedido); para acciones positivas el rojo confunde.
 */
export function confirmar(titulo, mensaje, onConfirmar, textoConfirmar = 'Confirmar', destructivo = false) {
  if (!manejador) {
    console.warn('AlertProvider no esta montado:', titulo, mensaje);
    return;
  }
  manejador({ titulo, mensaje, onConfirmar, textoConfirmar, destructivo });
}
