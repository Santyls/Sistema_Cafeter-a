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

export default function StockBajo({ navigate, inventory, onMarkAlertsAsAddressed }) {
  const lowStockItems = inventory.filter((item) => item.actual <= item.minimum);

  const handleEdit = (itemName) => {
    Alert.alert('Reabastecer', `Ingresa cantidad para reabastecer ${itemName} en el sistema.`);
  };

  const handleClearAll = () => {
    onMarkAlertsAsAddressed();
    Alert.alert('Exito', 'Todas las alertas de stock han sido marcadas como atendidas.');
    navigate('dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.emptyText}>No hay alertas. Inventario optimo!</Text>
          </View>
        ) : (
          lowStockItems.map((item, index) => (
            <View key={index} style={styles.alertCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="alert" size={20} color="#FF3B30" />
                </View>
                <View style={styles.details}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.warningText}>
                    Disponibles: <Text style={{ fontWeight: 'bold' }}>{item.actual} {item.unit}</Text>
                  </Text>
                  <Text style={styles.limitText}>Minimo requerido: {item.minimum} {item.unit}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item.name)}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2D1E16', paddingVertical: 18, paddingHorizontal: 16 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginTop: 20 },
  alertCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.08)' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255, 59, 48, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  details: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#2D1E16' },
  warningText: { fontSize: 14, color: '#FF3B30', marginTop: 4 },
  limitText: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  actionBtn: { backgroundColor: '#2D1E16', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, marginLeft: 10 },
  actionBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  footer: { padding: 20, backgroundColor: 'transparent' },
  clearBtn: { backgroundColor: '#8D6E63', borderRadius: 16, height: 54, justifyContent: 'center', alignItems: 'center' },
  clearBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
