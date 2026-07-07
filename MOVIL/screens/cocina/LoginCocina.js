import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator,
  StatusBar as RNStatusBar,
} from 'react-native';
import Icon from '../shared/Icon';

export default function LoginCocina({ navigate, onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePressLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(username || 'cocinero1', password || 'cocinero123');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.logoContainer}>
            <Icon name="coffee" size={40} color="#2D1E16" />
          </View>
          <Text style={styles.appTitleText}>CoffeeFlow Pro</Text>
          <Text style={styles.appSubtitleText}>Modulo de Cocina</Text>

          <View style={styles.formCard}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>ID de Cocinero / Correo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. juan.chef"
                placeholderTextColor="#8E8E93"
                value={username}
                onChangeText={setUsername}
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
              onPress={handlePressLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.btnText}>Iniciar Sesion</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linksContainer} onPress={() => navigate('recuperar')}>
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
    backgroundColor: '#2D1E16',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#F9F8F6',
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(45, 30, 22, 0.08)',
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
    color: '#2D1E16',
  },
  appSubtitleText: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
    color: '#8E8E93',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
  },
  formGroup: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
    color: '#8E8E93',
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#1C1C1E',
    borderColor: 'rgba(45, 30, 22, 0.08)',
  },
  btn: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D1E16',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  linksText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8D6E63',
  },
  linksTextMuted: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
});
