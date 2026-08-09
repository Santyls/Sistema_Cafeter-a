import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { API_BASE_URL } from '../config/api';

// Paleta compartida con el resto de la app (navy + dorado).
const colors = {
  primary: '#0A1931',
  secondary: '#9A7B1C',
  bg: '#F5F2EB',
  cardBg: 'rgba(255, 255, 255, 0.98)',
  textMain: '#0A1931',
  textMuted: '#556375',
  border: 'rgba(154, 123, 28, 0.25)',
};

// Cada rol operativo entra a su propio modulo. El rol 'admin' se gestiona
// exclusivamente desde el panel web y no tiene acceso a la app movil.
const MODULO_POR_ROL = {
  mesero: 'cliente_mesero',
  cocinero: 'cocina',
  cajero: 'caja',
};

const MENSAJE_CREDENCIALES = 'Correo o contraseña incorrectos.';

export default function LoginUnificado({ onLoginSuccess }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  // Mensajes en un modal propio: el Alert de React Native no existe en web,
  // asi que los avisos se veran igual en navegador y en dispositivo.
  const [mensaje, setMensaje] = useState(null);

  const mostrarMensaje = (titulo, texto) => setMensaje({ titulo, texto });

  const handleLogin = () => {
    const identificador = correo.trim().toLowerCase();

    if (!identificador || !contrasena) {
      mostrarMensaje('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setCargando(true);
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: identificador, contrasena }),
    })
      .then((res) => {
        if (!res.ok) {
          // No se distingue entre usuario inexistente y contrasena incorrecta.
          throw new Error(MENSAJE_CREDENCIALES);
        }
        return res.json();
      })
      .then((data) => {
        const usuario = data.usuario;
        const modulo = MODULO_POR_ROL[usuario.rol];

        // Las cuentas sin modulo movil (admin) reciben el mismo mensaje que unas
        // credenciales invalidas, para no revelar que la cuenta existe ni su rol.
        if (!modulo) {
          setCargando(false);
          mostrarMensaje('Error de inicio de sesión', MENSAJE_CREDENCIALES);
          return;
        }

        setCargando(false);
        setContrasena('');
        onLoginSuccess({ token: data.access_token, usuario, modulo });
      })
      .catch((error) => {
        setCargando(false);
        mostrarMensaje(
          'Error de inicio de sesión',
          error.message === MENSAJE_CREDENCIALES
            ? MENSAJE_CREDENCIALES
            : 'No se pudo conectar con el servidor.'
        );
      });
  };

  const handleOlvidoContrasena = () => {
    mostrarMensaje(
      'Restablecer contraseña',
      'Contacta al administrador de TI para restablecer tu contraseña.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Ionicons name="cafe" size={40} color={colors.primary} />
          </View>
          <Text style={styles.appTitleText}>CoffeeFlow Pro</Text>
          <Text style={styles.appSubtitleText}>Sistema de Gestión de Cafetería</Text>

          <View style={styles.formCard}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. correo@cafeteria.com"
                placeholderTextColor={colors.textMuted}
                value={correo}
                onChangeText={setCorreo}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contraseña de Acceso</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese su contraseña"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={contrasena}
                onChangeText={setContrasena}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={cargando}>
              {cargando ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.btnText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linksContainer} onPress={handleOlvidoContrasena}>
              <Text style={styles.linksText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={!!mensaje}
          transparent
          animationType="fade"
          onRequestClose={() => setMensaje(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{mensaje?.titulo}</Text>
              <Text style={styles.modalText}>{mensaje?.texto}</Text>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setMensaje(null)}>
                <Text style={styles.btnText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  appContainer: { flex: 1, backgroundColor: colors.bg },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  appTitleText: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    color: colors.primary,
  },
  appSubtitleText: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
    color: colors.textMuted,
  },
  formCard: { width: '100%', maxWidth: 400 },
  formGroup: { marginBottom: 16, width: '100%' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
    color: colors.textMuted,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
    backgroundColor: colors.cardBg,
    color: colors.textMain,
    borderColor: colors.border,
  },
  btn: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  linksContainer: { marginTop: 12, alignItems: 'center' },
  linksText: { fontSize: 14, fontWeight: '500', color: colors.secondary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 49, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: 20,
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
});
