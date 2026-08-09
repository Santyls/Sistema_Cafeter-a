import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  StatusBar as RNStatusBar,
  Alert,
} from "react-native";
import Icon from "../shared/Icon";

import { API_BASE_URL } from '../../config/api';
export default function Login({ cambiarPantalla, onBack, onLoginSuccess }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const iniciarSesion = () => {
    const userLower = usuario.trim().toLowerCase();
    if (!userLower || !password) {
      Alert.alert("Campos Incompletos", "Por favor ingresa tu ID/Correo y contraseña.");
      return;
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: userLower,
        contrasena: password,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || 'Credenciales incorrectas');
          });
        }
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        const user = data.usuario;
        if (user.rol !== 'cajero' && user.rol !== 'admin') {
          Alert.alert('Acceso Denegado', 'Tu rol no tiene acceso a este módulo de Caja.');
          return;
        }
        if (cambiarPantalla) {
          cambiarPantalla("aperturaTurno");
        }
        if (onLoginSuccess) {
          onLoginSuccess(data.access_token, user);
        }
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert('Error de Inicio de Sesión', error.message || 'No se pudo conectar con el servidor.');
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.logoContainer}>
            <Icon name="coffee" size={40} color="#0A1931" />
          </View>
          <Text style={styles.appTitleText}>CoffeeFlow Pro</Text>
          <Text style={styles.appSubtitleText}>Modulo de Caja</Text>

          <View style={styles.formCard}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>ID de Cajero / Correo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. maria.cajera"
                placeholderTextColor="#8E8E93"
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contrasena de Acceso</Text>
              <TextInput
                style={styles.input}
                placeholder="Cualquier contrasena"
                placeholderTextColor="#8E8E93"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={iniciarSesion}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.btnText}>Iniciar Sesion</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linksContainer}>
              <Text style={styles.linksText}>Olvidaste tu contrasena?</Text>
            </TouchableOpacity>

            {onBack && (
              <TouchableOpacity style={styles.linksContainer} onPress={onBack}>
                <Text style={styles.linksTextMuted}>Volver al menu de modulos</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A1931",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  appContainer: { flex: 1, backgroundColor: "#FCFAF7" },
  authScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(154, 123, 28, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  appTitleText: { fontSize: 28, fontWeight: "bold", letterSpacing: -0.5, color: "#0A1931" },
  appSubtitleText: { fontSize: 14, marginTop: 4, marginBottom: 24, color: "#8E8E93" },
  formCard: { width: "100%", maxWidth: 400 },
  formGroup: { marginBottom: 16, width: "100%" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginLeft: 4, color: "#8E8E93" },
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    color: "#1C1C1E",
    borderColor: "rgba(154, 123, 28, 0.15)",
  },
  btn: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A1931",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  linksContainer: { marginTop: 12, alignItems: "center" },
  linksText: { fontSize: 14, fontWeight: "500", color: "#9A7B1C" },
  linksTextMuted: { fontSize: 14, fontWeight: "500", color: "#8E8E93" },
});
