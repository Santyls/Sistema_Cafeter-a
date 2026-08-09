import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Aviso dentro de la app. Se usa en lugar de Alert.alert porque en la version
 * web de React Native el Alert no muestra nada y el usuario se queda sin
 * respuesta despues de una accion.
 */
export function useAviso() {
  const [aviso, setAviso] = useState(null);
  return {
    aviso,
    mostrarAviso: (titulo, texto) => setAviso({ titulo, texto }),
    // Aviso con dos botones; onConfirm se ejecuta al aceptar.
    confirmar: (titulo, texto, onConfirm, textoConfirmar = 'Confirmar') =>
      setAviso({ titulo, texto, onConfirm, textoConfirmar }),
    cerrarAviso: () => setAviso(null),
  };
}

export default function AvisoModal({ aviso, onClose }) {
  const esConfirmacion = !!aviso?.onConfirm;

  const aceptar = () => {
    const accion = aviso?.onConfirm;
    onClose();
    if (accion) accion();
  };

  return (
    <Modal visible={!!aviso} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.titulo}>{aviso?.titulo}</Text>
          <Text style={styles.texto}>{aviso?.texto}</Text>
          <View style={styles.acciones}>
            {esConfirmacion && (
              <TouchableOpacity style={[styles.btn, styles.btnSecundario]} onPress={onClose}>
                <Text style={styles.btnSecundarioText}>Cancelar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btn} onPress={aceptar}>
              <Text style={styles.btnText}>
                {esConfirmacion ? aviso.textoConfirmar : 'Aceptar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 49, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(154, 123, 28, 0.25)',
  },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0A1931', marginBottom: 8 },
  texto: { fontSize: 15, lineHeight: 22, color: '#556375', marginBottom: 20 },
  acciones: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1931',
  },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  btnSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(154, 123, 28, 0.35)',
  },
  btnSecundarioText: { color: '#556375', fontSize: 16, fontWeight: '600' },
});
