import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import Icon from '../shared/Icon';

export default function Inventario({ navigate, toggleSidebar, inventory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventario</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ingrediente..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.tabBtn, activeCategory === cat && styles.tabBtnActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, { flex: 2 }]}>Ingrediente</Text>
          <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Actual</Text>
          <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Minimo</Text>
          <Text style={[styles.colHeader, { flex: 1.2, textAlign: 'right' }]}>Estado</Text>
        </View>

        {filteredInventory.map((item, index) => {
          const status = getStockStatus(item.actual, item.minimum);
          const progressPercent = Math.min(100, (item.actual / (item.minimum * 2)) * 100);

          return (
            <View key={index} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.qtyText}>
                  {item.actual} {item.unit}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.qtyText, { color: '#8E8E93' }]}>
                  {item.minimum} {item.unit}
                </Text>
              </View>
              <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                <View style={styles.statusBarContainer}>
                  <View
                    style={[
                      styles.statusBarFill,
                      { width: `${progressPercent}%`, backgroundColor: status.color },
                    ]}
                  />
                </View>
                <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  searchSection: { paddingHorizontal: 16, paddingTop: 16 },
  searchInput: { backgroundColor: '#ffffff', borderRadius: 12, height: 48, paddingHorizontal: 16, fontSize: 15, borderWidth: 1, borderColor: '#e5e5ea' },
  tabsWrapper: { paddingVertical: 14 },
  tabsScroll: { paddingHorizontal: 16 },
  tabBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e5ea', backgroundColor: '#ffffff', marginRight: 10 },
  tabBtnActive: { backgroundColor: '#2D1E16', borderColor: '#2D1E16' },
  tabText: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  listContent: { backgroundColor: '#ffffff', borderRadius: 20, marginHorizontal: 16, padding: 16, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#f2f2f7', paddingBottom: 10, marginBottom: 10 },
  colHeader: { fontSize: 12, fontWeight: 'bold', color: '#8E8E93', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f2f2f7' },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#2D1E16' },
  itemCategory: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  qtyText: { fontSize: 14, fontWeight: '600', color: '#2D1E16' },
  statusBarContainer: { width: 60, height: 6, backgroundColor: '#e5e5ea', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  statusBarFill: { height: '100%', borderRadius: 3 },
  statusLabel: { fontSize: 11, fontWeight: 'bold' },
});
