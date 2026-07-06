import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '../shared/Icon';

export default function Historial({ navigate, toggleSidebar, orders }) {
  const [selectedRange, setSelectedRange] = useState('Hoy');
  const historyOrders = orders.filter((o) => o.status === 'listo' || o.status === 'entregado');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.datePickerSim}>
        <Text style={styles.dateLabel}>Rango de fechas:</Text>
        <TouchableOpacity style={styles.dateSelector}>
          <View style={styles.dateRow}>
            <Icon name="calendar" size={16} color="#2D1E16" />
            <Text style={styles.dateText}> 01/06/2026 - 05/06/2026</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {historyOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay pedidos registrados en el historial.</Text>
          </View>
        ) : (
          historyOrders.map((order) => (
            <View key={order.id} style={styles.historyCard}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.orderId}>Pedido #{order.id}</Text>
                  <Text style={styles.tableText}>{order.table}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Listo</Text>
                </View>
              </View>
              <View style={styles.cardDetails}>
                <Text style={styles.detailText}>Hora: {order.time}</Text>
                <Text style={styles.detailText}>Cocinero: {order.cook || 'Juan'}</Text>
                <Text style={styles.detailText}>Tiempo de preparacion: 15 min</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  datePickerSim: { backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5ea' },
  dateLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '600' },
  dateSelector: { backgroundColor: '#F9F8F6', borderRadius: 12, height: 44, justifyContent: 'center', paddingHorizontal: 12, marginTop: 8, borderWidth: 1, borderColor: '#e5e5ea' },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 14, color: '#2D1E16', fontWeight: '500' },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: '#8E8E93' },
  historyCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f2f2f7', paddingBottom: 10, marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#2D1E16' },
  tableText: { fontSize: 13, color: '#8D6E63', fontWeight: '600', marginTop: 2 },
  statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#34C759', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  cardDetails: { gap: 4 },
  detailText: { fontSize: 13, color: '#555555' },
});
