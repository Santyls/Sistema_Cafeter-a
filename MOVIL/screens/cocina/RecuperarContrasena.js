import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from '../shared/Icon';

export default function RecuperarContrasena({ navigate }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSendCode = () => {
    if (email.trim().includes('@')) {
      setSubmitted(true);
    } else {
      alert('Ingresa un correo electronico valido');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('login')}>
          <Icon name="back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recuperar Contrasena</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>
          Te enviaremos un codigo de verificacion para restablecer tu contrasena.
        </Text>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electronico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#8D6E63"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSendCode}>
            <Text style={styles.btnText}>Enviar Codigo</Text>
          </TouchableOpacity>

          {submitted && (
            <View style={styles.successCard}>
              <Icon name="check-circle" size={20} color="#27ae60" style={{ marginRight: 12 }} />
              <Text style={styles.successText}>
                Si el correo existe, te enviaremos un codigo de recuperacion.
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => navigate('login')} style={styles.loginLink}>
          <View style={styles.linkRow}>
            <Icon name="back" size={16} color="#8D6E63" />
            <Text style={styles.loginLinkText}> Volver al Login</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  backBtn: { padding: 8 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  scrollContent: { padding: 24 },
  description: { fontSize: 16, color: '#555555', lineHeight: 24, marginBottom: 24, textAlign: 'center' },
  formCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#8D6E63', fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e5e5ea', borderRadius: 12, height: 50, paddingHorizontal: 16, fontSize: 16, color: '#2D1E16' },
  btn: { backgroundColor: '#2D1E16', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  successCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52, 199, 89, 0.1)', borderWidth: 1, borderColor: '#34C759', borderRadius: 12, padding: 16, marginTop: 20 },
  successText: { flex: 1, color: '#27ae60', fontSize: 14, fontWeight: '500' },
  loginLink: { alignItems: 'center', paddingVertical: 10 },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  loginLinkText: { color: '#8D6E63', fontSize: 16, fontWeight: '600' },
});
