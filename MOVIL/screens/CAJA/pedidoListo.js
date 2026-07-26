import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import Icon from "../shared/Icon";
import PrimaryButton from "./components/PrimaryButton";
import FadeInView from "../shared/FadeInView";

export default function PedidoListo({ cambiarPantalla, toggleSidebar, orders = [], mesas = [], seleccionarMesa }) {
  const readyOrders = orders.filter((o) => o.status === 'listo');

  const handleCobrar = (pedido) => {
    const tableId = pedido.tableId;
    const tableObj = mesas.find(m => String(m.id) === String(tableId));
    if (tableObj && seleccionarMesa) {
      seleccionarMesa(tableObj);
    } else {
      // Fallback
      cambiarPantalla("pago");
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Pedidos listos"
        subtitle="Listos para cobrar"
        onBack={() => cambiarPantalla("inicio")}
        rightAction={{ icon: "menu", onPress: toggleSidebar }}
      />

      <ScrollView contentContainerStyle={styles.body}>
        {readyOrders.length === 0 ? (
          <FadeInView style={styles.emptyContainer} translateY={10}>
            <Icon name="check-circle" size={60} color={Colors.success} />
            <Text style={styles.emptyText}>No hay pedidos listos por cobrar por el momento.</Text>
          </FadeInView>
        ) : (
          readyOrders.map((pedido, index) => (
            <FadeInView key={pedido.id} delay={index * 100} translateY={20} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.mesaBadge}>
                  <Text style={styles.mesaText}>{pedido.tableName || pedido.table || `Mesa ${pedido.tableId}`}</Text>
                </View>
                <View style={styles.horaBadge}>
                  <Icon name="time" size={14} color={Colors.success} />
                  <Text style={styles.horaText}> {pedido.time || pedido.timeStamp || 'Hace un momento'}</Text>
                </View>
              </View>
              <View style={styles.itemsList}>
                {((pedido.items || pedido.products) || []).map((item, idx) => (
                  <Text key={idx} style={styles.itemText}>
                    • {item.product?.name || item.name} (x{item.qty})
                  </Text>
                ))}
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusBadge}>
                  <Icon name="check-circle" size={16} color={Colors.success} />
                  <Text style={styles.statusText}> Listo en Barra</Text>
                </View>
              </View>
              <PrimaryButton
                title="Cobrar pedido"
                onPress={() => handleCobrar(pedido)}
                style={{ marginTop: 12 }}
              />
            </FadeInView>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  mesaBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mesaText: { color: Colors.white, fontWeight: "700", fontSize: 14 },
  horaBadge: { flexDirection: "row", alignItems: "center" },
  horaText: { color: Colors.success, fontSize: 13, fontWeight: "600" },
  itemsList: { marginBottom: 12 },
  itemText: { color: Colors.textLight, fontSize: 15, marginBottom: 4 },
  statusRow: { flexDirection: "row" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.libre,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { color: Colors.success, fontSize: 13, fontWeight: "700" },
  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: Colors.textLight, fontWeight: '600' },
});
