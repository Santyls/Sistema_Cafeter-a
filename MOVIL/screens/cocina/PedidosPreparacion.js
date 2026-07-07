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
import getTheme from '../shared/theme';

export default function PedidosPreparacion({ navigate, toggleSidebar, orders, onSelectOrder, darkMode }) {
  const theme = getTheme(darkMode);
  const prepOrders = orders.filter((o) => o.status === 'en_preparacion');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>En Preparacion</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {prepOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="flame" size={60} color="#007AFF" />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay pedidos en preparacion actualmente.</Text>
          </View>
        ) : (
          prepOrders.map((order) => (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: theme.cardBg }]}>
              <View style={[styles.cardTop, { borderBottomColor: theme.border }]}>
                <View>
                  <Text style={[styles.orderId, { color: theme.textMain }]}>Pedido #{order.id}</Text>
                  <Text style={styles.tableText}>{order.table}</Text>
                </View>
                <View style={styles.timerBadge}>
                  <Icon name="time" size={12} color="#007AFF" />
                  <Text style={styles.timerText}> {order.estimatedTime || '15 min'}</Text>
                </View>
              </View>
              <View style={styles.cardMiddle}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Productos:</Text>
                <View style={styles.productsList}>
                  {order.products.map((item, idx) => (
                    <Text key={idx} style={[styles.productText, { color: theme.textMain }]}>
                      {item.name} (x{item.qty})
                    </Text>
                  ))}
                </View>
                <View style={styles.cookRow}>
                  <Icon name="person" size={13} color="#8E8E93" />
                  <Text style={[styles.cookText, { color: theme.textMuted }]}> Cocinero asignado: {order.cook || 'Juan'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  onSelectOrder(order.id);
                  navigate('actualizar_estado');
                }}
              >
                <Text style={styles.actionBtnText}>Actualizar Estado</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
  orderCard: { borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 12, marginBottom: 12 },
  orderId: { fontSize: 18, fontWeight: 'bold' },
  tableText: { fontSize: 14, color: '#8D6E63', fontWeight: '600' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  timerText: { color: '#007AFF', fontSize: 12, fontWeight: '700' },
  cardMiddle: { marginBottom: 16 },
  infoLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  productsList: { marginBottom: 10, paddingLeft: 4 },
  productText: { fontSize: 15, marginBottom: 4, fontWeight: '500' },
  cookRow: { flexDirection: 'row', alignItems: 'center' },
  cookText: { fontSize: 13, fontStyle: 'italic' },
  actionBtn: { backgroundColor: '#2D1E16', borderRadius: 12, height: 44, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
