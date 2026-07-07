import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
import Icon from '../shared/Icon';
import getTheme from '../shared/theme';

const RANGE_OPTIONS = [
  { id: 'hoy', label: 'Hoy', text: 'Hoy - 06/07/2026' },
  { id: 'ayer', label: 'Ayer', text: 'Ayer - 05/07/2026' },
  { id: 'semana', label: 'Esta semana', text: '30/06/2026 - 06/07/2026' },
  { id: 'mes', label: 'Este mes', text: '01/07/2026 - 06/07/2026' },
];

export default function Historial({ navigate, toggleSidebar, orders, darkMode }) {
  const theme = getTheme(darkMode);
  const [selectedRange, setSelectedRange] = useState(RANGE_OPTIONS[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const historyOrders = orders.filter((o) => o.status === 'listo' || o.status === 'entregado');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.datePickerSim, { backgroundColor: theme.cardBg, borderBottomColor: theme.border }]}>
        <Text style={[styles.dateLabel, { color: theme.textMuted }]}>Rango de fechas:</Text>
        <TouchableOpacity style={[styles.dateSelector, { backgroundColor: theme.bg, borderColor: theme.borderStrong }]} onPress={() => setPickerOpen(true)}>
          <View style={styles.dateRow}>
            <Icon name="calendar" size={16} color={theme.textMain} />
            <Text style={[styles.dateText, { color: theme.textMain }]}> {selectedRange.text}</Text>
          </View>
          <Icon name="chevron" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {historyOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay pedidos registrados en el historial.</Text>
          </View>
        ) : (
          historyOrders.map((order) => (
            <View key={order.id} style={[styles.historyCard, { backgroundColor: theme.cardBg }]}>
              <View style={[styles.cardTop, { borderBottomColor: theme.border }]}>
                <View>
                  <Text style={[styles.orderId, { color: theme.textMain }]}>Pedido #{order.id}</Text>
                  <Text style={styles.tableText}>{order.table}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Listo</Text>
                </View>
              </View>
              <View style={styles.cardDetails}>
                <Text style={[styles.detailText, { color: theme.textMuted }]}>Hora: {order.time}</Text>
                <Text style={[styles.detailText, { color: theme.textMuted }]}>Cocinero: {order.cook || 'Juan'}</Text>
                <Text style={[styles.detailText, { color: theme.textMuted }]}>Tiempo de preparacion: 15 min</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.textMain }]}>Selecciona un rango</Text>
            {RANGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.rangeOption, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setSelectedRange(opt);
                  setPickerOpen(false);
                }}
              >
                <Text style={[styles.rangeOptionText, { color: theme.textMain }, selectedRange.id === opt.id && styles.rangeOptionActive]}>
                  {opt.label}
                </Text>
                {selectedRange.id === opt.id && <Icon name="check" size={16} color="#2D1E16" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  datePickerSim: { padding: 16, borderBottomWidth: 1 },
  dateLabel: { fontSize: 12, fontWeight: '600' },
  dateSelector: { borderRadius: 12, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 8, borderWidth: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 14, fontWeight: '500' },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16 },
  historyCard: { borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 10, marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: 'bold' },
  tableText: { fontSize: 13, color: '#8D6E63', fontWeight: '600', marginTop: 2 },
  statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#34C759', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  cardDetails: { gap: 4 },
  detailText: { fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 400, borderRadius: 20, padding: 12 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', padding: 12 },
  rangeOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 1 },
  rangeOptionText: { fontSize: 15, fontWeight: '500' },
  rangeOptionActive: { fontWeight: '700' },
});
