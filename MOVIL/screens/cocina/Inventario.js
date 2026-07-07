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
} from 'react-native';
import Icon from '../shared/Icon';
import getTheme from '../shared/theme';

export default function Inventario({ navigate, toggleSidebar, inventory, onRestockItem, darkMode }) {
  const theme = getTheme(darkMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');

  const categories = ['Todos', 'Cafe', 'Lacteos', 'Panaderia', 'Otros'];

  const filteredInventory = inventory.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = activeCategory === 'Todos' || item.category === activeCategory;
    return searchMatch && categoryMatch;
  });

  const getStockStatus = (actual, minimum) => {
    const ratio = actual / minimum;
    if (ratio <= 1.0) return { color: '#FF3B30', label: 'Critico' };
    if (ratio <= 1.5) return { color: '#FF9500', label: 'Bajo' };
    return { color: '#34C759', label: 'Optimo' };
  };

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventario</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.inputBg, borderColor: theme.borderStrong, color: theme.textMain }]}
          placeholder="Buscar ingrediente..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.tabBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderStrong }, activeCategory === cat && styles.tabBtnActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabText, { color: theme.textMuted }, activeCategory === cat && styles.tabTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={[styles.listContent, { backgroundColor: theme.cardBg }]}>
        <View style={[styles.tableHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.colHeader, { flex: 2, color: theme.textMuted }]}>Ingrediente</Text>
          <Text style={[styles.colHeader, { flex: 1, textAlign: 'center', color: theme.textMuted }]}>Actual</Text>
          <Text style={[styles.colHeader, { flex: 1, textAlign: 'center', color: theme.textMuted }]}>Minimo</Text>
          <Text style={[styles.colHeader, { flex: 1.3, textAlign: 'right', color: theme.textMuted }]}> </Text>
        </View>

        {filteredInventory.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No se encontraron ingredientes.</Text>
        ) : (
          filteredInventory.map((item, index) => {
            const status = getStockStatus(item.actual, item.minimum);
            const progressPercent = Math.min(100, (item.actual / (item.minimum * 2)) * 100);

            return (
              <View key={index} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                <View style={{ flex: 2 }}>
                  <Text style={[styles.itemName, { color: theme.textMain }]}>{item.name}</Text>
                  <Text style={[styles.itemCategory, { color: theme.textMuted }]}>{item.category}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={[styles.qtyText, { color: theme.textMain }]}>
                    {item.actual} {item.unit}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={[styles.qtyText, { color: theme.textMuted }]}>
                    {item.minimum} {item.unit}
                  </Text>
                </View>
                <View style={{ flex: 1.3, alignItems: 'flex-end' }}>
                  <View style={styles.statusBarContainer}>
                    <View
                      style={[
                        styles.statusBarFill,
                        { width: `${progressPercent}%`, backgroundColor: status.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                  <TouchableOpacity style={styles.restockBtn} onPress={() => openRestock(item)}>
                    <Icon name="add" size={12} color="#ffffff" />
                    <Text style={styles.restockBtnText}>Reabastecer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

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
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  searchSection: { paddingHorizontal: 16, paddingTop: 16 },
  searchInput: { borderRadius: 12, height: 48, paddingHorizontal: 16, fontSize: 15, borderWidth: 1 },
  tabsWrapper: { paddingVertical: 14 },
  tabsScroll: { paddingHorizontal: 16 },
  tabBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10 },
  tabBtnActive: { backgroundColor: '#2D1E16', borderColor: '#2D1E16' },
  tabText: { fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  listContent: { borderRadius: 20, marginHorizontal: 16, padding: 16, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1.5, paddingBottom: 10, marginBottom: 10 },
  colHeader: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  itemName: { fontSize: 15, fontWeight: 'bold' },
  itemCategory: { fontSize: 11, marginTop: 2 },
  qtyText: { fontSize: 14, fontWeight: '600' },
  statusBarContainer: { width: 60, height: 6, backgroundColor: '#e5e5ea', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  statusBarFill: { height: '100%', borderRadius: 3 },
  statusLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  restockBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2D1E16', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, gap: 4 },
  restockBtnText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', paddingVertical: 30, fontSize: 14 },
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
