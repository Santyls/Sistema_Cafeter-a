import { Alert, Platform } from 'react-native';

/**
 * Avisos y confirmaciones de la app.
 *
 * En dispositivo se usa el dialogo del sistema y en web un modal propio. La razon es
 * que dos <Modal> de React Native abiertos a la vez NO funcionan de forma confiable en
 * Android/iOS: el segundo aparece detras del primero, y si la pantalla se desmonta con
 * ambos abiertos la app se congela. Web es la unica plataforma que tolera modales
 * apilados, por eso el problema no se ve en el preview.
 *
 * Como casi siempre se confirma algo desde dentro de otro modal (elegir cantidad de un
 * producto, registrar un gasto), el aviso no puede ser otro <Modal>. El dialogo del
 * sistema no lo es: vive fuera del arbol de vistas y siempre queda encima.
 *
 * En web Alert.alert es un no-op, asi que ahi si se usa el modal del AlertProvider.
 */

const ES_WEB = Platform.OS === 'web';

let manejador = null;

export function registrarManejadorDeAvisos(fn) {
  manejador = fn;
}

export function mostrarMensaje(titulo, mensaje, onDismiss) {
  if (!ES_WEB) {
    Alert.alert(titulo, mensaje, [{ text: 'Aceptar', onPress: onDismiss }]);
    return;
  }

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
  if (!ES_WEB) {
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: textoConfirmar,
        style: destructivo ? 'destructive' : 'default',
        onPress: onConfirmar,
      },
    ]);
    return;
  }

  if (!manejador) {
    console.warn('AlertProvider no esta montado:', titulo, mensaje);
    return;
  }
  manejador({ titulo, mensaje, onConfirmar, textoConfirmar, destructivo });
}
