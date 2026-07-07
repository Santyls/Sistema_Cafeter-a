import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import Icon from '../shared/Icon';
import getTheme from '../shared/theme';

export default function DashboardCocina({
  navigate,
  toggleSidebar,
  orders,
  inventory,
  notifications,
  currentUser,
  darkMode,
}) {
  const theme = getTheme(darkMode);
  const pendingCount = orders.filter((o) => o.status === 'pendiente').length;
  const progressCount = orders.filter((o) => o.status === 'en_preparacion').length;
  const readyCount = orders.filter((o) => o.status === 'listo').length;
  const lowStockCount = inventory.filter((i) => i.actual <= i.minimum).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.appContainer, { backgroundColor: theme.bg }]}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleGroup}>
              <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
                <Icon name="menu" size={22} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>CoffeeFlow &bull; Panel de Cocina</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} onPress={() => navigate('notificaciones')}>
              <Icon name="bell" size={20} color="#ffffff" />
              {unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Bienvenido, {currentUser || 'Cocinero'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg }]} onPress={() => navigate('pedidos', { filter: 'pendiente' })}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FFF9DB' }]}>
                <Icon name="clipboard" size={20} color="#F0AD4E" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Pedidos{"\n"}Pendientes</Text>
              <Text style={[styles.cardNumber, { color: '#F0AD4E' }]}>{pendingCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg }]} onPress={() => navigate('preparacion')}>
              <View style={[styles.iconWrapper, { backgroundColor: '#E3F2FD' }]}>
                <Icon name="flame" size={20} color="#007AFF" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>En{"\n"}Preparacion</Text>
              <Text style={[styles.cardNumber, { color: '#007AFF' }]}>{progressCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg }]} onPress={() => navigate('listos')}>
              <View style={[styles.iconWrapper, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="check-circle" size={20} color="#34C759" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Listos{"\n"}para Servir</Text>
              <Text style={[styles.cardNumber, { color: '#34C759' }]}>{readyCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg }]} onPress={() => navigate('inventario')}>
              <View style={[styles.iconWrapper, { backgroundColor: '#EFEBE9' }]}>
                <Icon name="cube" size={20} color="#8D6E63" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Inventario{"\n"}Insumos</Text>
              <Text style={[styles.cardTextButton, { color: '#8D6E63' }]}>Ver</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg }]} onPress={() => navigate('stock_bajo')}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FFEBEE' }]}>
                <Icon name="warning" size={20} color="#FF3B30" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Alertas{"\n"}de Stock</Text>
              <Text style={[styles.cardNumber, { color: '#FF3B30' }]}>{lowStockCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg }]} onPress={() => navigate('historial')}>
              <View style={[styles.iconWrapper, { backgroundColor: '#F3E5F5' }]}>
                <Icon name="receipt" size={20} color="#9b59b6" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Historial{"\n"}de Pedidos</Text>
              <Text style={[styles.cardTextButton, { color: '#9b59b6' }]}>Ver</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitySection}>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>Actividad Reciente</Text>
            <View style={[styles.activityList, { backgroundColor: theme.cardBg }]}>
              <View style={[styles.activityItem, { borderBottomColor: theme.border }]}>
                <Icon name="cube" size={20} color="#007AFF" style={{ marginRight: 16 }} />
                <View style={styles.activityDetails}>
                  <Text style={[styles.activityText, { color: theme.textMain }]}>Pedido #1254 recibido</Text>
                  <Text style={[styles.activityTime, { color: theme.textMuted }]}>Hace 2 min</Text>
                </View>
              </View>
              <View style={[styles.activityItem, { borderBottomColor: theme.border }]}>
                <Icon name="check-circle" size={20} color="#34C759" style={{ marginRight: 16 }} />
                <View style={styles.activityDetails}>
                  <Text style={[styles.activityText, { color: theme.textMain }]}>Pedido #1251 marcado como listo</Text>
                  <Text style={[styles.activityTime, { color: theme.textMuted }]}>Hace 5 min</Text>
                </View>
              </View>
              {lowStockCount > 0 && (
                <View style={[styles.activityItem, { borderBottomColor: theme.border }]}>
                  <Icon name="warning" size={20} color="#FF3B30" style={{ marginRight: 16 }} />
                  <View style={styles.activityDetails}>
                    <Text style={[styles.activityText, { color: theme.textMain }]}>Stock critico: Insumos por reabastecer</Text>
                    <Text style={[styles.activityTime, { color: theme.textMuted }]}>Hace 10 min</Text>
                  </View>
                </View>
              )}
            </View>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.8,
    color: '#D7CCC8',
  },
  bellBtn: { padding: 4, position: 'relative' },
  badge: { position: 'absolute', right: -4, top: -2, backgroundColor: '#FF3B30', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#ffffff', width: '48%', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, alignItems: 'flex-start' },
  iconWrapper: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', lineHeight: 18 },
  cardNumber: { fontSize: 28, fontWeight: 'bold', marginTop: 8 },
  cardTextButton: { fontSize: 18, fontWeight: 'bold', marginTop: 14 },
  activitySection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D1E16', marginBottom: 16 },
  activityList: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f2' },
  activityDetails: { flex: 1 },
  activityText: { fontSize: 14, fontWeight: '600', color: '#2D1E16' },
  activityTime: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
});
