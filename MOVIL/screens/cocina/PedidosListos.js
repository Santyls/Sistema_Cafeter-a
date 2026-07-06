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

export default function PedidosListos({ navigate, toggleSidebar, orders }) {
  const readyOrders = orders.filter((o) => o.status === 'listo');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Listos para Servir</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {readyOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="check-circle" size={60} color="#34C759" />
            <Text style={styles.emptyText}>No hay pedidos listos para entregar.</Text>
          </View>
        ) : (
          readyOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>Pedido #{order.id}</Text>
                  <Text style={styles.tableText}>{order.table}</Text>
                </View>
                <Text style={styles.timeText}>{order.time}</Text>
              </View>
              <View style={styles.productsBox}>
                {order.products.map((item, idx) => (
                  <Text key={idx} style={styles.productItem}>
                    {item.name} (x{item.qty})
                  </Text>
                ))}
              </View>
              <View style={styles.notificationBanner}>
                <Icon name="check" size={14} color="#34C759" style={{ marginRight: 8 }} />
                <Text style={styles.notificationText}>Notificado al mesero ({order.waiter})</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomBanner}>
        <Icon name="coffee" size={24} color="#ffffff" style={{ marginRight: 16 }} />
        <Text style={styles.bannerText}>
          Estos pedidos han sido notificados al mesero y estan listos en barra.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginTop: 20 },
  orderCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#f2f2f7', paddingBottom: 12, marginBottom: 12 },
  orderId: { fontSize: 18, fontWeight: 'bold', color: '#2D1E16' },
  tableText: { fontSize: 14, color: '#8D6E63', fontWeight: '600', marginTop: 2 },
  timeText: { fontSize: 13, color: '#8E8E93' },
  productsBox: { marginBottom: 14 },
  productItem: { fontSize: 15, color: '#2D1E16', marginBottom: 4, fontWeight: '500' },
  notificationBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  notificationText: { fontSize: 13, color: '#2e7d32', fontWeight: '600' },
  bottomBanner: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#2D1E16', padding: 20, flexDirection: 'row', alignItems: 'center', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  bannerText: { flex: 1, color: '#ffffff', fontSize: 13, fontWeight: '500', lineHeight: 18 },
});
