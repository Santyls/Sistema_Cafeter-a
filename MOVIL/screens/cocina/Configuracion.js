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
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import Icon from '../shared/Icon';
import getTheme from '../shared/theme';
import useTurno from '../shared/useTurno';
import AvisoModal, { useAviso } from '../shared/AvisoModal';
import { API_BASE_URL } from '../../config/api';

// Los tipos de aviso que genera la cocina, con su etiqueta visible.
const ETIQUETA_ALERTA = {
  new: 'Nuevo pedido',
  ready: 'Pedido listo',
  low_stock: 'Inventario',
};

export default function Configuracion({
  navigate,
  toggleSidebar,
  currentUser,
  onLogout,
  darkMode,
  setDarkMode,
  sessionUser,
  inicioTurno,
  orders = [],
  notifications = [],
  onMarkAllNotificationsRead,
  onPerfilActualizado,
  token,
}) {
  const theme = getTheme(darkMode);
  const { aviso, mostrarAviso, confirmar, cerrarAviso } = useAviso();
  const [subScreen, setSubScreen] = useState('main');
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Duracion real del turno, contada desde el inicio de sesion.
  const shiftTime = useTurno(inicioTurno);

  // Datos reales del cocinero autenticado.
  const nombreCompleto = sessionUser
    ? `${sessionUser.nombre} ${sessionUser.apellido_paterno || ''}`.trim()
    : currentUser || 'Cocinero';

  const [editName, setEditName] = useState(sessionUser?.nombre || '');
  const [editLastName, setEditLastName] = useState(sessionUser?.apellido_paterno || '');
  const [editEmail, setEditEmail] = useState(sessionUser?.correo || '');
  const [editPhone, setEditPhone] = useState(sessionUser?.telefono || '');

  // Produccion real del turno: pedidos que esta cocina dejo listos o entregados hoy.
  const { salesTotal, completedOrdersCount, tiempoPromedio } = React.useMemo(() => {
    const hoy = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
    const preparados = orders.filter(
      (o) =>
        ['listo', 'entregado', 'entregado_pagado'].includes(o.status) &&
        (!o.fecha || o.fecha === hoy)
    );
    const total = preparados.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    // Tiempo promedio entre que el pedido entra y se marca listo, segun su historial.
    const duraciones = preparados
      .map((o) => {
        const hist = o.history || [];
        const inicio = hist[0];
        const listo = hist.find((h) => h.status === 'listo');
        if (!inicio?.time || !listo?.time) return null;
        const aMinutos = (t) => {
          const [hh, mm] = String(t).split(':');
          const h = parseInt(hh, 10);
          const m = parseInt(mm, 10);
          if (Number.isNaN(h) || Number.isNaN(m)) return null;
          return h * 60 + m;
        };
        const a = aMinutos(inicio.time);
        const b = aMinutos(listo.time);
        if (a === null || b === null || b < a) return null;
        return b - a;
      })
      .filter((d) => d !== null);

    const promedio = duraciones.length
      ? Math.round(duraciones.reduce((a, b) => a + b, 0) / duraciones.length)
      : null;

    return {
      salesTotal: total,
      completedOrdersCount: preparados.length,
      tiempoPromedio: promedio,
    };
  }, [orders]);

  // Historial real de avisos recibidos por la cocina.
  const notificationHistory = notifications;
  const avisosSinLeer = notifications.filter((n) => !n.read).length;

  // Iniciales del nombre real (dos primeras letras de nombre y apellido).
  const iniciales = React.useMemo(() => {
    const partes = nombreCompleto.split(' ').filter(Boolean);
    if (partes.length === 0) return 'CO';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }, [nombreCompleto]);

  const guardarPerfil = () => {
    if (!editName.trim()) {
      mostrarAviso('Datos incompletos', 'El nombre no puede quedar vacio.');
      return;
    }

    setGuardando(true);
    fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: editName.trim(),
        apellido_paterno: editLastName.trim(),
        telefono: editPhone.trim(),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron guardar los cambios.');
        return res.json();
      })
      .then((usuarioActualizado) => {
        setGuardando(false);
        if (onPerfilActualizado) onPerfilActualizado(usuarioActualizado);
        mostrarAviso('Perfil actualizado', 'Tus datos se guardaron correctamente.');
        setSubScreen('main');
      })
      .catch((error) => {
        setGuardando(false);
        mostrarAviso('Error', error.message || 'No se pudo conectar con el servidor.');
      });
  };

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
              <Text style={[styles.cardHeaderTitle, { color: theme.textMain, borderBottomColor: theme.border }]}>Produccion del Turno</Text>
              <Text style={styles.bigNumber}>{completedOrdersCount}</Text>
              <Text style={[styles.mutedCenter, { color: theme.textMuted }]}>
                {completedOrdersCount === 1 ? 'pedido preparado hoy' : 'pedidos preparados hoy'}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Metricas de Eficiencia</Text>
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View style={styles.receiptRow}>
                <Text style={[styles.textMuted, { color: theme.textMuted }]}>Valor de lo preparado</Text>
                <Text style={[styles.textBold, { color: theme.textMain }]}>${salesTotal.toFixed(2)} MXN</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.textMuted, { color: theme.textMuted }]}>Ticket Promedio</Text>
                <Text style={[styles.textBold, { color: theme.textMain }]}>
                  ${(salesTotal / (completedOrdersCount || 1)).toFixed(2)} MXN
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.textMuted, { color: theme.textMuted }]}>Tiempo Promedio Preparacion</Text>
                <Text style={[styles.textBold, { color: theme.textMain }]}>
                  {tiempoPromedio !== null ? `${tiempoPromedio} min` : 'Sin datos aun'}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.textMuted, { color: theme.textMuted }]}>Duracion del turno</Text>
                <Text style={[styles.textBold, { color: theme.textMain }]}>{shiftTime}</Text>
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
              {notificationHistory.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 60 }}>
                  <Icon name="bell-outline" size={48} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted, fontSize: 15, marginTop: 16 }}>
                    Sin avisos por ahora.
                  </Text>
                </View>
              ) : (
                notificationHistory.map((item) => (
                  <View
                    key={item.id}
                    style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }, !item.read && { borderLeftWidth: 4, borderLeftColor: '#5BC0DE' }]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, color: '#9A7B1C', fontWeight: 'bold' }}>
                        {ETIQUETA_ALERTA[item.type] || 'Sistema'}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.textMuted }}>{item.time}</Text>
                    </View>
                    <Text style={{ color: theme.textMain, fontSize: 13 }}>{item.message}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            {notificationHistory.length > 0 && (
              <TouchableOpacity style={styles.btn} onPress={onMarkAllNotificationsRead}>
                <Text style={styles.btnText}>Marcar todas como leidas</Text>
              </TouchableOpacity>
            )}
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
                <Text style={styles.avatarText}>{iniciales}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Datos Personales</Text>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Rol asignado</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value="Cocinero" editable={false} />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Nombre</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderStrong, color: theme.textMain }]} value={editName} onChangeText={setEditName} />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Apellido paterno</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderStrong, color: theme.textMain }]} value={editLastName} onChangeText={setEditLastName} />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Correo electronico</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={editEmail} editable={false} keyboardType="email-address" />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Numero de telefono</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.borderStrong, color: theme.textMain }]} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
            </View>

            <TouchableOpacity style={[styles.btn, guardando && { opacity: 0.6 }]} onPress={guardarPerfil} disabled={guardando}>
              <Text style={styles.btnText}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnOutlineDanger, { backgroundColor: theme.cardBg }]} onPress={onLogout}>
              <Text style={{ color: '#D9534F', fontWeight: '600', textAlign: 'center' }}>Cerrar Sesion</Text>
            </TouchableOpacity>
          </ScrollView>
          <AvisoModal aviso={aviso} onClose={cerrarAviso} />
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
              <Text style={styles.avatarText}>{iniciales}</Text>
            </View>
            <Text style={[styles.waiterName, { color: theme.textMain }]}>{nombreCompleto}</Text>
            <Text style={[styles.waiterRole, { color: theme.textMuted }]}>Cocinero</Text>
            <View style={[styles.shiftBadge, { backgroundColor: '#4E8D7022' }]}>
              <Text style={{ color: '#4E8D70', fontWeight: '600', fontSize: 13 }}>● Turno Activo</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Panel de Turno</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.receiptRow}>
              <Text style={[styles.textMuted, { color: theme.textMuted }]}>Duracion de Turno</Text>
              <Text style={[styles.textBold, { color: theme.textMain }]}>{shiftTime}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.textMuted, { color: theme.textMuted }]}>Pedidos preparados</Text>
              <Text style={[styles.textBold, { color: theme.textMain }]}>{completedOrdersCount}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.textMuted, { color: theme.textMuted }]}>Avisos sin leer</Text>
              <Text style={[styles.textBold, { color: theme.textMain }]}>{avisosSinLeer}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={[styles.smallBtn, { flex: 1 }]} onPress={() => setSubScreen('statistics')}>
                <Text style={styles.smallBtnText}>Ver Reportes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, { flex: 1 }]} onPress={() => setSubScreen('alerts')}>
                <Text style={styles.smallBtnText}>Alertas</Text>
              </TouchableOpacity>
            </View>

            {/* El turno de cocina dura lo que dura la sesion: cerrarla lo finaliza. */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#D9534F', marginTop: 12 }]}
              onPress={() =>
                confirmar(
                  'Finalizar jornada',
                  `Llevas ${shiftTime} en turno. Al finalizar se cerrara tu sesion.`,
                  onLogout,
                  'Finalizar'
                )
              }
            >
              <Text style={styles.btnText}>Finalizar Jornada</Text>
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
        <AvisoModal aviso={aviso} onClose={cerrarAviso} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A1931',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  appContainer: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#0A1931',
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
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#9A7B1C', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, color: '#ffffff', fontWeight: 'bold' },
  avatarCameraBtn: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#ffffff', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  waiterName: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  waiterRole: { fontSize: 14, marginTop: 2 },
  shiftBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#9A7B1C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  textMuted: {},
  textBold: { fontWeight: 'bold' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  smallBtn: { backgroundColor: '#0A1931', borderRadius: 12, paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  smallBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  btn: { width: '100%', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1931', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2, marginTop: 10 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  btnOutline: { width: '100%', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginTop: 10, marginBottom: 40 },
  btnOutlineDanger: { width: '100%', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderColor: '#D9534F', borderWidth: 1, marginTop: 12, marginBottom: 40 },
  formGroup: { marginBottom: 16, width: '100%' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  input: { width: '100%', padding: 16, borderRadius: 16, borderWidth: 1, fontSize: 15, backgroundColor: 'rgba(255,255,255,0.95)', color: '#1C1C1E', borderColor: 'rgba(45, 30, 22, 0.08)' },
  inputDisabled: { backgroundColor: 'rgba(45, 30, 22, 0.08)', color: '#8E8E93' },
  bigNumber: { color: '#0A1931', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 12 },
  mutedCenter: { fontSize: 12, textAlign: 'center' },
});
