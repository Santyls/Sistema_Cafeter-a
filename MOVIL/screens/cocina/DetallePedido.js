import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from '../shared/Icon';

export default function DetallePedido({
  navigate,
  activeOrderId,
  orders,
  onStartPreparation,
  onCancelOrder,
}) {
  const order = orders.find((o) => o.id === activeOrderId);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No se encontro la comanda.</Text>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return '#F0AD4E';
      case 'en_preparacion': return '#007AFF';
      case 'listo': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const handleStart = () => {
    onStartPreparation(order.id);
    navigate('preparacion');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Pedido',
      'Estas seguro de que deseas cancelar este pedido de la cocina?',
      [
        { text: 'Atras', style: 'cancel' },
        {
          text: 'Si, cancelar',
          style: 'destructive',
          onPress: () => {
            onCancelOrder(order.id);
            navigate('pedidos');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('pedidos')}>
          <Icon name="back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Pedido</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.orderId}>Pedido #{order.id}</Text>
              <Text style={styles.timestamp}>Comanda de las {order.time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Mesa</Text>
              <Text style={styles.detailVal}>{order.table}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Mesero</Text>
              <Text style={styles.detailVal}>{order.waiter}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Productos</Text>
        <View style={styles.productsCard}>
          {order.products.map((item, index) => (
            <View key={index} style={styles.productRow}>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>x{item.qty}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Observaciones Especiales</Text>
        <View style={styles.notesCard}>
          <Text style={styles.notesText}>
            {order.observations || 'Sin observaciones especiales para este pedido.'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Tiempo Estimado</Text>
        <View style={styles.timeCard}>
          <Icon name="time" size={20} color="#2D1E16" style={{ marginRight: 12 }} />
          <Text style={styles.timeText}>{order.estimatedTime || '15 - 20 min'}</Text>
        </View>

        {order.status === 'pendiente' && (
          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>Iniciar Preparacion</Text>
          </TouchableOpacity>
        )}

        {order.status === 'en_preparacion' && (
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: '#34C759' }]}
            onPress={() => navigate('actualizar_estado')}
          >
            <Text style={styles.startBtnText}>Actualizar Estado / Terminar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Cancelar Pedido</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  scrollContent: { padding: 20 },
  infoCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f2f2f7', paddingBottom: 16, marginBottom: 16 },
  orderId: { fontSize: 20, fontWeight: 'bold', color: '#2D1E16' },
  timestamp: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  detailBox: { width: '48%' },
  detailLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase' },
  detailVal: { fontSize: 16, fontWeight: 'bold', color: '#2D1E16', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#8D6E63', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  productsCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f2f2f7' },
  qtyBadge: { backgroundColor: '#EFEBE9', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  qtyText: { color: '#2D1E16', fontWeight: 'bold', fontSize: 14 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#2D1E16' },
  notesCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  notesText: { fontSize: 15, color: '#555555', lineHeight: 22 },
  timeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  timeText: { fontSize: 16, fontWeight: '600', color: '#2D1E16' },
  startBtn: { backgroundColor: '#2D1E16', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  startBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  cancelBtn: { backgroundColor: 'transparent', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FF3B30', marginBottom: 20 },
  cancelBtnText: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },
  errorText: { fontSize: 18, textAlign: 'center', color: '#FF3B30', marginTop: 40 },
});
