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
import getTheme from '../shared/theme';

export default function Notificaciones({
  navigate,
  notifications,
  onMarkAllNotificationsRead,
  onClearNotifications,
  darkMode,
}) {
  const theme = getTheme(darkMode);

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'new': return { icon: 'cube', iconColor: '#007AFF', bg: '#E3F2FD', border: 'rgba(0,122,255,0.1)' };
      case 'ready': return { icon: 'check-circle', iconColor: '#34C759', bg: '#E8F5E9', border: 'rgba(52,199,89,0.1)' };
      case 'low_stock': return { icon: 'warning', iconColor: '#FF3B30', bg: '#FFEBEE', border: 'rgba(255,59,48,0.1)' };
      default: return { icon: 'bell', iconColor: '#8E8E93', bg: theme.cardBg, border: theme.border };
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Limpiar notificaciones',
      'Se eliminaran todas las notificaciones. Esta accion no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', style: 'destructive', onPress: onClearNotifications },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('dashboard')}>
          <Icon name="back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="bell-outline" size={60} color="#8E8E93" />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No tienes notificaciones en este momento.</Text>
          </View>
        ) : (
          notifications.map((notif) => {
            const nStyle = getNotificationStyle(notif.type);
            return (
              <View
                key={notif.id}
                style={[
                  styles.notifCard,
                  { backgroundColor: nStyle.bg, borderColor: nStyle.border },
                  !notif.read && styles.unreadCard,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Icon name={nStyle.icon} size={20} color={nStyle.iconColor} />
                </View>
                <View style={styles.content}>
                  <Text style={[styles.messageText, !notif.read && styles.unreadText]}>
                    {notif.message}
                  </Text>
                  <Text style={styles.timeText}>{notif.time}</Text>
                </View>
                {!notif.read && <View style={styles.unreadDot} />}
              </View>
            );
          })
        )}
      </ScrollView>

      {notifications.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btn} onPress={onMarkAllNotificationsRead}>
            <Text style={styles.btnText}>Marcar todas como leidas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>Limpiar notificaciones</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  scrollContent: { padding: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, marginTop: 20 },
  notifCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, position: 'relative' },
  unreadCard: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  content: { flex: 1 },
  messageText: { fontSize: 14, color: '#555555', lineHeight: 20 },
  unreadText: { fontWeight: 'bold', color: '#2D1E16' },
  timeText: { fontSize: 11, color: '#8E8E93', marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF', position: 'absolute', right: 16, top: 16 },
  footer: { padding: 16, gap: 10 },
  btn: { backgroundColor: '#2D1E16', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  clearBtn: { backgroundColor: 'transparent', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FF3B30' },
  clearBtnText: { color: '#FF3B30', fontSize: 15, fontWeight: '700' },
});
