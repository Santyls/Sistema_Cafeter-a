import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '../shared/Icon';

export default function DashboardCocina({
  navigate,
  toggleSidebar,
  orders,
  inventory,
  notifications,
  currentUser,
}) {
  const pendingCount = orders.filter((o) => o.status === 'pendiente').length;
  const progressCount = orders.filter((o) => o.status === 'en_preparacion').length;
  const readyCount = orders.filter((o) => o.status === 'listo').length;
  const lowStockCount = inventory.filter((i) => i.actual <= i.minimum).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CoffeeFlow</Text>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigate('notificaciones')}>
          <Icon name="bell" size={22} color="#ffffff" />
          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Hola, {currentUser || 'Cocinero'}!</Text>
          <Text style={styles.welcomeSubtitle}>Resumen general de la cocina</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.card} onPress={() => navigate('pedidos', { filter: 'pendiente' })}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF9DB' }]}>
              <Icon name="clipboard" size={20} color="#F0AD4E" />
            </View>
            <Text style={styles.cardTitle}>Pedidos{"\n"}Pendientes</Text>
            <Text style={[styles.cardNumber, { color: '#F0AD4E' }]}>{pendingCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigate('preparacion')}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="flame" size={20} color="#007AFF" />
            </View>
            <Text style={styles.cardTitle}>En{"\n"}Preparacion</Text>
            <Text style={[styles.cardNumber, { color: '#007AFF' }]}>{progressCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigate('listos')}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="check-circle" size={20} color="#34C759" />
            </View>
            <Text style={styles.cardTitle}>Listos{"\n"}para Servir</Text>
            <Text style={[styles.cardNumber, { color: '#34C759' }]}>{readyCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigate('inventario')}>
            <View style={[styles.iconWrapper, { backgroundColor: '#EFEBE9' }]}>
              <Icon name="cube" size={20} color="#8D6E63" />
            </View>
            <Text style={styles.cardTitle}>Inventario{"\n"}Insumos</Text>
            <Text style={[styles.cardTextButton, { color: '#8D6E63' }]}>Ver</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigate('stock_bajo')}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFEBEE' }]}>
              <Icon name="warning" size={20} color="#FF3B30" />
            </View>
            <Text style={styles.cardTitle}>Alertas{"\n"}de Stock</Text>
            <Text style={[styles.cardNumber, { color: '#FF3B30' }]}>{lowStockCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigate('historial')}>
            <View style={[styles.iconWrapper, { backgroundColor: '#F3E5F5' }]}>
              <Icon name="receipt" size={20} color="#9b59b6" />
            </View>
            <Text style={styles.cardTitle}>Historial{"\n"}de Pedidos</Text>
            <Text style={[styles.cardTextButton, { color: '#9b59b6' }]}>Ver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <Icon name="cube" size={20} color="#007AFF" style={{ marginRight: 16 }} />
              <View style={styles.activityDetails}>
                <Text style={styles.activityText}>Pedido #1254 recibido</Text>
                <Text style={styles.activityTime}>Hace 2 min</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Icon name="check-circle" size={20} color="#34C759" style={{ marginRight: 16 }} />
              <View style={styles.activityDetails}>
                <Text style={styles.activityText}>Pedido #1251 marcado como listo</Text>
                <Text style={styles.activityTime}>Hace 5 min</Text>
              </View>
            </View>
            {lowStockCount > 0 && (
              <View style={styles.activityItem}>
                <Icon name="warning" size={20} color="#FF3B30" style={{ marginRight: 16 }} />
                <View style={styles.activityDetails}>
                  <Text style={styles.activityText}>Stock critico: Insumos por reabastecer</Text>
                  <Text style={styles.activityTime}>Hace 10 min</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  bellBtn: { padding: 4, position: 'relative' },
  badge: { position: 'absolute', right: -4, top: -2, backgroundColor: '#FF3B30', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  welcomeSection: { marginBottom: 24 },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D1E16' },
  welcomeSubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
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
