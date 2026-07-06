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

export default function ListaPedidos({
  navigate,
  toggleSidebar,
  orders,
  onSelectOrder,
  defaultFilter = 'Todos',
}) {
  const [activeTab, setActiveTab] = useState(defaultFilter);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['Todos', 'Pendientes', 'En Preparacion', 'Listos'];

  const filteredOrders = orders.filter((order) => {
    let tabMatch = false;
    if (activeTab === 'Todos') tabMatch = true;
    else if (activeTab === 'Pendientes') tabMatch = order.status === 'pendiente';
    else if (activeTab === 'En Preparacion') tabMatch = order.status === 'en_preparacion';
    else if (activeTab === 'Listos') tabMatch = order.status === 'listo';

    const searchString = `${order.id} ${order.table} ${order.status}`.toLowerCase();
    const queryMatch = searchString.includes(searchQuery.toLowerCase());

    return tabMatch && queryMatch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pendiente': return { bg: '#FFF9DB', text: '#F0AD4E', label: 'Pendiente' };
      case 'en_preparacion': return { bg: '#E3F2FD', text: '#007AFF', label: 'En Preparacion' };
      case 'listo': return { bg: '#E8F5E9', text: '#34C759', label: 'Listo' };
      default: return { bg: '#F2F2F7', text: '#8E8E93', label: status };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pedido, mesa o cliente..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredOrders.length === 0 ? (
          <Text style={styles.emptyText}>No hay pedidos para mostrar</Text>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = getStatusStyle(order.status);
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => {
                  onSelectOrder(order.id);
                  navigate('detalle_pedido');
                }}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>Pedido {order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Icon name="location" size={14} color="#8D6E63" />
                    <Text style={styles.infoLabel}> Mesa:</Text>
                    <Text style={styles.infoValue}>{order.table}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="time" size={14} color="#8D6E63" />
                    <Text style={styles.infoLabel}> Hora:</Text>
                    <Text style={styles.infoValue}>{order.time}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="restaurant" size={14} color="#8D6E63" />
                    <Text style={styles.infoLabel}> Items:</Text>
                    <Text style={styles.infoValue}>
                      {order.products.map((p) => `${p.name} (x${p.qty})`).join(', ')}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardArrow}>Ver detalle</Text>
                  <Icon name="forward" size={14} color="#8D6E63" />
                </View>
              </TouchableOpacity>
            );
          })
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
  searchSection: { paddingHorizontal: 16, paddingTop: 16 },
  searchInput: { backgroundColor: '#ffffff', borderRadius: 12, height: 48, paddingHorizontal: 16, fontSize: 15, borderWidth: 1, borderColor: '#e5e5ea' },
  tabsWrapper: { paddingVertical: 14 },
  tabsScroll: { paddingHorizontal: 16 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e5e5ea', backgroundColor: '#ffffff', marginRight: 10 },
  tabBtnActive: { backgroundColor: '#2D1E16', borderColor: '#2D1E16' },
  tabText: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  orderCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f2f2f7', paddingBottom: 12 },
  orderId: { fontSize: 18, fontWeight: 'bold', color: '#2D1E16' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  cardBody: { paddingVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: '#8D6E63' },
  infoValue: { flex: 1, fontSize: 14, color: '#2D1E16', marginLeft: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  cardArrow: { color: '#8D6E63', fontSize: 13, fontWeight: '700', marginRight: 4 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontSize: 16 },
});
