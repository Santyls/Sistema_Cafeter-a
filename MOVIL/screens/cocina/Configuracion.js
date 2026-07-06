import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from '../shared/Icon';

export default function Configuracion({ navigate, toggleSidebar, currentUser, onLogout }) {
  const handleEditProfile = () => {
    Alert.alert('Editar Perfil', 'Funcionalidad disponible en la version de produccion.');
  };

  const handleChangePassword = () => {
    Alert.alert('Cambiar Contrasena', 'Se enviara un correo para restablecer tu contrasena.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuracion</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser ? currentUser.substring(0, 2).toUpperCase() : 'CO'}
            </Text>
          </View>
          <Text style={styles.profileName}>{currentUser || 'Cocinero'}</Text>
          <Text style={styles.profileRole}>Cocinero Principal</Text>
          <Text style={styles.profileEmail}>cocina.flow@coffeeflow.com</Text>
        </View>

        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuRow} onPress={handleEditProfile}>
            <View style={styles.menuRowLeft}>
              <Icon name="person" size={18} color="#2D1E16" />
              <Text style={styles.menuRowText}> Editar Perfil</Text>
            </View>
            <Icon name="chevron" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={handleChangePassword}>
            <View style={styles.menuRowLeft}>
              <Icon name="lock" size={18} color="#2D1E16" />
              <Text style={styles.menuRowText}> Cambiar Contrasena</Text>
            </View>
            <Icon name="chevron" size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Sistema</Text>
        <View style={styles.menuGroup}>
          <View style={styles.infoRow}>
            <View style={styles.menuRowLeft}>
              <Icon name="cloud" size={18} color="#2D1E16" />
              <Text style={styles.menuRowText}> Sincronizacion con API</Text>
            </View>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeText}>Conectado</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.menuRowLeft}>
              <Icon name="wifi" size={18} color="#2D1E16" />
              <Text style={styles.menuRowText}> Estado de Conexion</Text>
            </View>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeText}>Estable</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.menuRowLeft}>
              <Icon name="info" size={18} color="#2D1E16" />
              <Text style={styles.menuRowText}> Informacion de la App</Text>
            </View>
            <Text style={styles.infoVal}>Version 1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutBtnText}>Cerrar Sesion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  scrollContent: { padding: 20 },
  profileCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#8D6E63', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 28, color: '#ffffff', fontWeight: 'bold' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#2D1E16' },
  profileRole: { fontSize: 14, color: '#8D6E63', fontWeight: '600', marginTop: 4 },
  profileEmail: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8D6E63', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  menuGroup: { backgroundColor: '#ffffff', borderRadius: 20, paddingHorizontal: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f2f2f7' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f2f2f7' },
  menuRowLeft: { flexDirection: 'row', alignItems: 'center' },
  menuRowText: { fontSize: 15, fontWeight: '600', color: '#2D1E16' },
  badgeSuccess: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#34C759', fontSize: 12, fontWeight: 'bold' },
  infoVal: { fontSize: 14, color: '#8E8E93' },
  logoutBtn: { backgroundColor: 'transparent', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FF3B30', marginTop: 10, marginBottom: 30 },
  logoutBtnText: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },
});
