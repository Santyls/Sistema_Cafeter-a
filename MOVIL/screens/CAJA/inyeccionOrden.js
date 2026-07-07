import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

import Colors from "./styles/colors";
import Icon from "../shared/Icon";
import PrimaryButton from "./components/PrimaryButton";

export default function InyeccionOrden({ mesa, pedido, cambiarPantalla, limpiarPedido }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name="check-circle" size={60} color={Colors.success} />
        </View>
        <Text style={styles.title}>Orden enviada</Text>
        <Text style={styles.subtitle}>
          El pedido de la Mesa {mesa?.numero} fue enviado a cocina
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Mesa</Text>
            <Text style={styles.value}>{mesa?.numero}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Productos</Text>
            <Text style={styles.value}>{pedido.length} items</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>En preparacion</Text>
            </View>
          </View>
        </View>

        <PrimaryButton
          title="Volver a mesas"
          onPress={() => {
            if (limpiarPedido) limpiarPedido();
            cambiarPantalla("inicio");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: "center", padding: 25 },
  iconCircle: { alignSelf: "center", marginBottom: 10 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    marginTop: 15,
  },
  subtitle: {
    textAlign: "center",
    color: Colors.textLight,
    marginTop: 10,
    fontSize: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    marginBottom: 30,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  label: { color: Colors.textLight, fontSize: 16 },
  value: { fontSize: 16, fontWeight: "700", color: Colors.text },
  badge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: "#E65100", fontSize: 13, fontWeight: "700" },
});
