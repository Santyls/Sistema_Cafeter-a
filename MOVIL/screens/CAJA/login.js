import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Icon from "../shared/Icon";

export default function Login({ cambiarPantalla }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const iniciarSesion = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      cambiarPantalla("inicio");
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoBadge}>
            <Icon name="coffee" size={40} color="#3E2B22" />
          </View>
          <Text style={styles.title}>CoffeeFlow</Text>
          <Text style={styles.subtitle}>Sistema de Caja</Text>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuario</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu usuario"
                placeholderTextColor="#8D6E63"
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contrasena</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="********"
                  placeholderTextColor="#8D6E63"
                  secureTextEntry={secureText}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeBtn}>
                  <Icon name={secureText ? "eye" : "lock"} size={18} color="#8D6E63" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={iniciarSesion}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>Iniciar Sesion</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2D1E16" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24, alignItems: "center" },
  logoBadge: { width: 90, height: 90, backgroundColor: "#ffffff", borderRadius: 24, justifyContent: "center", alignItems: "center", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
  title: { fontSize: 32, fontWeight: "bold", color: "#ffffff", marginTop: 18 },
  subtitle: { fontSize: 16, color: "#D7CCC8", marginTop: 4, fontWeight: "500", marginBottom: 30 },
  formCard: { backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", width: "100%" },
  inputGroup: { marginBottom: 20 },
  label: { color: "#D7CCC8", fontSize: 14, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#ffffff", borderRadius: 16, height: 56, paddingHorizontal: 16, fontSize: 16, color: "#2D1E16" },
  passwordWrapper: { flexDirection: "row", backgroundColor: "#ffffff", borderRadius: 16, height: 56, alignItems: "center" },
  passwordInput: { flex: 1, height: "100%", paddingHorizontal: 16, fontSize: 16, color: "#2D1E16" },
  eyeBtn: { paddingHorizontal: 16 },
  loginBtn: { backgroundColor: "#8D6E63", borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", marginTop: 10, elevation: 4 },
  loginBtnText: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
});
