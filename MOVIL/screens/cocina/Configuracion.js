import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  TextInput,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import Icon from '../shared/Icon';
import getTheme from '../shared/theme';

export default function Configuracion({ navigate, toggleSidebar, currentUser, onLogout, darkMode, setDarkMode }) {
  const theme = getTheme(darkMode);
  const [subScreen, setSubScreen] = useState('main');
  const [clockedIn, setClockedIn] = useState(true);
  const [shiftTime] = useState('04:12 hrs');
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [editName, setEditName] = useState(currentUser || 'Juan Cocinero');
  const [editEmail, setEditEmail] = useState('cocina.flow@coffeeflow.com');
  const [editPhone, setEditPhone] = useState('+52 442 000 0000');

  const [salesTotal] = useState(1480.00);
  const [completedOrdersCount] = useState(9);

  const notificationHistory = [
    { id: 1, type: 'kitchen', message: 'Nuevo pedido #1004 recibido - Mesa 5', time: 'Hace 1 min', read: false },
    { id: 2, type: 'system', message: 'Stock bajo: Cafe en grano (2 kg disponibles)', time: 'Hace 5 min', read: false },
    { id: 3, type: 'kitchen', message: 'Pedido #1003 marcado como listo', time: 'Hace 15 min', read: true },
    { id: 4, type: 'system', message: 'Stock bajo: Croissants (4 pzas disponibles)', time: 'Hace 20 min', read: true },
  ];

  const renderHeader = (title, subtitle, showBack = false) => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View style={styles.headerTitleGroup}>
          {showBack ? (
            <TouchableOpacity style={styles.backButton} onPress={() => setSubScreen('main')}>
              <Icon name="back" size={20} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
              <Icon name="menu" size={22} color="#ffffff" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </View>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (subScreen === 'statistics') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.appContainer, { backgroundColor: theme.bg }]}>
          {renderHeader('Mis Estadisticas', 'Rendimiento en el turno', true)}
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Text style={[styles.cardHeaderTitle, { color: theme.textMain, borderBottomColor: theme.border }]}>Resumen de Ventas Acumuladas</Text>
              <Text style={styles.bigNumber}>${salesTotal.toFixed(2)} MXN</Text>
              <Text style={[styles.mutedCenter, { color: theme.textMuted }]}>
                Total correspondiente a {completedOrdersCount} comandas finalizadas hoy.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Ventas por Hora</Text>
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View style={styles.chartContainer}>
                {[
                  { hour: '10 AM', val: 120, height: 30 },
                  { hour: '11 AM', val: 340, height: 60 },
                  { hour: '12 PM', val: 490, height: 90 },
                  { hour: '01 PM', val: 280, height: 50 },
                  { hour: '02 PM', val: 150, height: 35 },
                ].map(bar => (
                  <View key={bar.hour} style={styles.chartCol}>
                    <Text style={[styles.chartLabel, { color: theme.textMuted }]}>${bar.val}</Text>
                    <View style={[styles.chartBar, { height: bar.height }]} />
                    <Text style={[styles.chartHour, { color: theme.textMain }]}>{bar.hour}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Metricas de Eficiencia</Text>
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View style={styles.receiptRow}>
                <Text style={[styles.textMuted, { color: theme.textMuted }]}>Ticket Promedio</Text>
                <Text style={[styles.textBold, { color: theme.textMain }]}>${(salesTotal / (completedOrdersCount || 1)).toFixed(2)} MXN</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.textMuted, { color: theme.textMuted }]}>Tiempo Promedio Servicio</Text>
                <Text style={[styles.textBold, { color: theme.textMain }]}>14 minutos</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (subScreen === 'alerts') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.appContainer, { backgroundColor: theme.bg }]}>
          {renderHeader('Centro de Alertas', 'Historial de avisos', true)}
          <View style={styles.contentContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notificationHistory.map((item) => (
                <View
                  key={item.id}
                  style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }, !item.read && { borderLeftWidth: 4, borderLeftColor: '#5BC0DE' }]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: '#8D6E63', fontWeight: 'bold' }}>
                      {item.type === 'kitchen' ? 'Cocina' : 'Sistema'}
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.textMuted }}>{item.time}</Text>
                  </View>
                  <Text style={{ color: theme.textMain, fontSize: 13 }}>{item.message}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.btn} onPress={() => Alert.alert('Listo', 'Todas las alertas marcadas como leidas.')}>
              <Text style={styles.btnText}>Marcar todas como leidas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (subScreen === 'edit_profile') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.appContainer, { backgroundColor: theme.bg }]}>
          {renderHeader('Editar Perfil', 'Configuracion de datos', true)}
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {currentUser ? currentUser.substring(0, 2).toUpperCase() : 'CO'}
                </Text>
                <TouchableOpacity style={styles.avatarCameraBtn}>
                  <Icon name="camera" size={14} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Datos Personales</Text>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Rol asignado</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value="Cocinero" editable={false} />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Nombre completo</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderStrong, color: theme.textMain }]} value={editName} onChangeText={setEditName} />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Correo electronico</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderStrong, color: theme.textMain }]} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Numero de telefono</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderStrong, color: theme.textMain }]} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
            </View>

            <TouchableOpacity style={styles.btn} onPress={() => { Alert.alert('Guardado', 'Datos actualizados.'); setSubScreen('main'); }}>
              <Text style={styles.btnText}>Guardar cambios</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnOutlineDanger, { backgroundColor: theme.cardBg }]} onPress={onLogout}>
              <Text style={{ color: '#D9534F', fontWeight: '600', textAlign: 'center' }}>Cerrar Sesion</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.appContainer, { backgroundColor: theme.bg }]}>
        {renderHeader('Configuracion', 'Informacion del cocinero y turno')}

        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border, alignItems: 'center' }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser ? currentUser.substring(0, 2).toUpperCase() : 'CO'}
              </Text>
            </View>
            <Text style={[styles.waiterName, { color: theme.textMain }]}>{currentUser || 'Cocinero'}</Text>
            <Text style={[styles.waiterRole, { color: theme.textMuted }]}>Cocinero</Text>
            <View style={[styles.shiftBadge, { backgroundColor: clockedIn ? '#4E8D7022' : '#D9534F22' }]}>
              <Text style={{ color: clockedIn ? '#4E8D70' : '#D9534F', fontWeight: '600', fontSize: 13 }}>
                {clockedIn ? '● Turno Activo' : '● Turno Finalizado'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Panel de Turno</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.receiptRow}>
              <Text style={[styles.textMuted, { color: theme.textMuted }]}>Duracion de Turno</Text>
              <Text style={[styles.textBold, { color: theme.textMain }]}>{shiftTime}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={[styles.smallBtn, { flex: 1 }]} onPress={() => setSubScreen('statistics')}>
                <Text style={styles.smallBtnText}>Ver Reportes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, { flex: 1 }]} onPress={() => setSubScreen('alerts')}>
                <Text style={styles.smallBtnText}>Alertas</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: clockedIn ? '#D9534F' : '#4E8D70', marginTop: 12 }]}
              onPress={() => {
                setClockedIn(!clockedIn);
                Alert.alert(
                  clockedIn ? 'Turno Finalizado' : 'Turno Iniciado',
                  clockedIn ? 'Has cerrado tu jornada.' : 'Jornada iniciada con exito.'
                );
              }}
            >
              <Text style={styles.btnText}>
                {clockedIn ? 'Finalizar Jornada (Clock-Out)' : 'Iniciar Jornada (Clock-In)'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border, paddingVertical: 4 }]}>
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.settingLabel, { color: theme.textMain }]}>Notificaciones de Cocina</Text>
              <Switch value={notificationsOn} onValueChange={setNotificationsOn} trackColor={{ false: '#ccc', true: '#4E8D70' }} />
            </View>
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.settingLabel, { color: theme.textMain }]}>Modo Oscuro</Text>
              <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: '#ccc', true: '#4E8D70' }} />
            </View>
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.settingLabel, { color: theme.textMain }]}>Sonidos del Sistema</Text>
              <Switch value={sounds} onValueChange={setSounds} trackColor={{ false: '#ccc', true: '#4E8D70' }} />
            </View>
          </View>

          <TouchableOpacity style={[styles.btnOutline, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => setSubScreen('edit_profile')}>
            <Text style={{ color: theme.textMain, fontWeight: '600', textAlign: 'center' }}>Editar Datos Personales</Text>
          </TouchableOpacity>
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
  appContainer: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#2D1E16',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuButton: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, marginTop: 4, opacity: 0.8, color: '#D7CCC8' },
  contentContainer: { flex: 1, padding: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeaderTitle: { fontSize: 16, fontWeight: 'bold', borderBottomWidth: 1, paddingBottom: 12, marginBottom: 8, textAlign: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#8D6E63', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, color: '#ffffff', fontWeight: 'bold' },
  avatarCameraBtn: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#ffffff', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  waiterName: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  waiterRole: { fontSize: 14, marginTop: 2 },
  shiftBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8D6E63', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  textMuted: {},
  textBold: { fontWeight: 'bold' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  smallBtn: { backgroundColor: '#2D1E16', borderRadius: 12, paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  smallBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  btn: { width: '100%', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2D1E16', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2, marginTop: 10 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  btnOutline: { width: '100%', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginTop: 10, marginBottom: 40 },
  btnOutlineDanger: { width: '100%', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderColor: '#D9534F', borderWidth: 1, marginTop: 12, marginBottom: 40 },
  formGroup: { marginBottom: 16, width: '100%' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  input: { width: '100%', padding: 16, borderRadius: 16, borderWidth: 1, fontSize: 15, backgroundColor: 'rgba(255,255,255,0.95)', color: '#1C1C1E', borderColor: 'rgba(45, 30, 22, 0.08)' },
  inputDisabled: { backgroundColor: 'rgba(45, 30, 22, 0.08)', color: '#8E8E93' },
  bigNumber: { color: '#2D1E16', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 12 },
  mutedCenter: { fontSize: 12, textAlign: 'center' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, paddingTop: 10 },
  chartCol: { alignItems: 'center' },
  chartBar: { width: 24, backgroundColor: '#2D1E16', borderRadius: 6 },
  chartLabel: { fontSize: 9, marginBottom: 4 },
  chartHour: { fontSize: 10, marginTop: 6 },
});
