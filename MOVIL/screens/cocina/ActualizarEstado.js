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

export default function ActualizarEstado({
  navigate,
  activeOrderId,
  orders,
  onUpdateStatus,
}) {
  const order = orders.find((o) => o.id === activeOrderId);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No se encontro el pedido.</Text>
      </SafeAreaView>
    );
  }

  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [comment, setComment] = useState('');

  const statusOptions = [
    { value: 'pendiente', label: 'Pendiente', color: '#F0AD4E' },
    { value: 'en_preparacion', label: 'En Preparacion', color: '#007AFF' },
    { value: 'listo', label: 'Listo para Servir', color: '#34C759' },
  ];

  const handleSave = () => {
    onUpdateStatus(order.id, selectedStatus, comment);
    if (selectedStatus === 'listo') {
      navigate('listos');
    } else if (selectedStatus === 'en_preparacion') {
      navigate('preparacion');
    } else {
      navigate('pedidos');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('detalle_pedido')}>
          <Icon name="back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Actualizar Estado</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.orderSummaryCard}>
          <Text style={styles.summaryTitle}>Pedido #{order.id}</Text>
          <Text style={styles.summaryTable}>{order.table}</Text>
          <Text style={styles.summaryTime}>Hora comanda: {order.time}</Text>
        </View>

        <Text style={styles.sectionTitle}>Cambiar Estado</Text>
        <View style={styles.optionsCard}>
          {statusOptions.map((opt) => {
            const isSelected = selectedStatus === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => setSelectedStatus(opt.value)}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                </View>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Comentario interno (opcional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ej: Se preparo sin condimentos adicionales..."
          placeholderTextColor="#8E8E93"
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
        />

        <Text style={styles.sectionTitle}>Historial de Cambios</Text>
        <View style={styles.historyCard}>
          {order.history && order.history.map((hist, idx) => (
            <View key={idx} style={styles.timelineRow}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>{hist.time}</Text>
                <Text style={styles.timelineText}>
                  Estado cambiado a <Text style={{fontWeight: 'bold'}}>{hist.status}</Text> por {hist.user}
                </Text>
                {hist.comment ? <Text style={styles.timelineComment}>"{hist.comment}"</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar Cambios</Text>
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
  orderSummaryCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  summaryTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D1E16' },
  summaryTable: { fontSize: 16, color: '#8D6E63', fontWeight: '600', marginTop: 4 },
  summaryTime: { fontSize: 13, color: '#8E8E93', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8D6E63', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  optionsCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 8, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
  optionRowSelected: { backgroundColor: '#F9F8F6' },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  optionLabel: { fontSize: 16, color: '#2D1E16', fontWeight: '500' },
  optionLabelSelected: { fontWeight: '700', color: '#2D1E16' },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#e5e5ea', justifyContent: 'center', alignItems: 'center' },
  radioOuterActive: { borderColor: '#2D1E16' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2D1E16' },
  textInput: { backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: '#e5e5ea', padding: 16, height: 100, fontSize: 15, color: '#2D1E16', textAlignVertical: 'top', marginBottom: 20 },
  historyCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  timelineRow: { flexDirection: 'row', marginBottom: 16 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8D6E63', marginTop: 4, marginRight: 16 },
  timelineContent: { flex: 1 },
  timelineTime: { fontSize: 12, color: '#8E8E93' },
  timelineText: { fontSize: 14, color: '#2D1E16', marginTop: 2 },
  timelineComment: { fontSize: 13, color: '#8D6E63', fontStyle: 'italic', marginTop: 4 },
  saveBtn: { backgroundColor: '#2D1E16', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  saveBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  errorText: { fontSize: 18, textAlign: 'center', color: '#FF3B30', marginTop: 40 },
});
