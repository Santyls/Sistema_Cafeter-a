import React from "react";
import { SafeAreaView, View, Text, ScrollView, StyleSheet } from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import Icon from "../shared/Icon";
import PrimaryButton from "./components/PrimaryButton";

const MOCK_PEDIDOS_LISTOS = [
  {
    id: 1,
    mesa: 3,
    items: ["2x Cappuccino", "1x Panini Jamon"],
    hora: "14:45",
  },
  {
    id: 2,
    mesa: 7,
    items: ["1x Latte", "2x Croissant", "1x Jugo Natural"],
    hora: "14:30",
  },
];

export default function PedidoListo({ cambiarPantalla, toggleSidebar }) {
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Pedidos listos"
        subtitle="Listos para cobrar"
        onBack={() => cambiarPantalla("inicio")}
        rightAction={{ icon: "menu", onPress: toggleSidebar }}
      />

      <ScrollView contentContainerStyle={styles.body}>
        {MOCK_PEDIDOS_LISTOS.map((pedido) => (
          <View key={pedido.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.mesaBadge}>
                <Text style={styles.mesaText}>Mesa {pedido.mesa}</Text>
              </View>
              <View style={styles.horaBadge}>
                <Icon name="time" size={14} color={Colors.success} />
                <Text style={styles.horaText}> {pedido.hora}</Text>
              </View>
            </View>
            <View style={styles.itemsList}>
              {pedido.items.map((item, idx) => (
                <Text key={idx} style={styles.itemText}>
                  {item}
                </Text>
              ))}
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <Icon name="check-circle" size={16} color={Colors.success} />
                <Text style={styles.statusText}> Listo para servir</Text>
              </View>
            </View>
            <PrimaryButton
              title="Cobrar pedido"
              onPress={() => cambiarPantalla("pago")}
              style={{ marginTop: 12 }}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
});
