import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import Icon from '../shared/Icon';
import getTheme from '../shared/theme';

export default function StockBajo({ navigate, inventory, onMarkAlertsAsAddressed, onRestockItem, darkMode }) {
  const theme = getTheme(darkMode);
  const lowStockItems = inventory.filter((item) => item.actual <= item.minimum);
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');

  const openRestock = (item) => {
    setRestockTarget(item);
    setRestockAmount('');
  };

  const confirmRestock = () => {
    const amount = parseFloat(restockAmount);
    if (restockTarget && !isNaN(amount) && amount > 0) {
      onRestockItem(restockTarget.name, amount);
    }
    setRestockTarget(null);
    setRestockAmount('');
  };

  const handleClearAll = () => {
    onMarkAlertsAsAddressed();
    Alert.alert('Exito', 'Todas las alertas de stock han sido marcadas como atendidas.');
    navigate('dashboard');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('dashboard')}>
          <Icon name="back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alertas de Stock Bajo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {lowStockItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="happy" size={60} color="#34C759" />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay alertas. Inventario optimo!</Text>
          </View>
        ) : (
          lowStockItems.map((item, index) => (
            <View key={index} style={[styles.alertCard, { backgroundColor: theme.cardBg }]}>
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="alert" size={20} color="#FF3B30" />
                </View>
                <View style={styles.details}>
                  <Text style={[styles.itemName, { color: theme.textMain }]}>{item.name}</Text>
                  <Text style={styles.warningText}>
                    Disponibles: <Text style={{ fontWeight: 'bold' }}>{item.actual} {item.unit}</Text>
                  </Text>
                  <Text style={[styles.limitText, { color: theme.textMuted }]}>Minimo requerido: {item.minimum} {item.unit}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openRestock(item)}>
                <Text style={styles.actionBtnText}>Reabastecer</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {lowStockItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
            <Text style={styles.clearBtnText}>Marcar todas como atendidas</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={!!restockTarget} transparent animationType="fade" onRequestClose={() => setRestockTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.textMain }]}>Reabastecer {restockTarget?.name}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              Disponible actualmente: {restockTarget?.actual} {restockTarget?.unit}
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.borderStrong, color: theme.textMain }]}
              placeholder={`Cantidad a agregar (${restockTarget?.unit || ''})`}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={restockAmount}
              onChangeText={setRestockAmount}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setRestockTarget(null)}>
                <Text style={[styles.modalCancelText, { color: theme.textMuted }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmRestock}>
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
  alertCard: { borderRadius: 20, padding: 16, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.08)' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255, 59, 48, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  details: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  warningText: { fontSize: 14, color: '#FF3B30', marginTop: 4 },
  limitText: { fontSize: 12, marginTop: 2 },
  actionBtn: { backgroundColor: '#2D1E16', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, marginLeft: 10 },
  actionBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  footer: { padding: 20, backgroundColor: 'transparent' },
  clearBtn: { backgroundColor: '#8D6E63', borderRadius: 16, height: 54, justifyContent: 'center', alignItems: 'center' },
  clearBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 400, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalSubtitle: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  modalInput: { borderRadius: 12, borderWidth: 1, height: 50, paddingHorizontal: 16, fontSize: 16 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { fontWeight: '600', fontSize: 15 },
  modalConfirmBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#2D1E16', justifyContent: 'center', alignItems: 'center' },
  modalConfirmText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});
