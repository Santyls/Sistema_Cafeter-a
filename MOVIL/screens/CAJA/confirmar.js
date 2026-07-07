import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import PrimaryButton from "./components/PrimaryButton";
import Icon from "../shared/Icon";

export default function Confirmar({
  mesa,
  pedido,
  subtotal,
  iva,
  total,
  cambiarPantalla,
}) {
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Confirmar pedido"
        subtitle={`Mesa ${mesa.numero}`}
        onBack={() => cambiarPantalla("pedido")}
      />

      <FlatList
        data={pedido}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 220 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.detalle}>
                {item.cantidad} x ${item.precio.toFixed(2)}
              </Text>
            </View>
            <Text style={styles.subtotalItem}>
              ${(item.cantidad * item.precio).toFixed(2)}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.resumen}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>IVA (16%)</Text>
          <Text style={styles.value}>${iva.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <PrimaryButton
          title="Enviar a cocina"
          onPress={() => cambiarPantalla("inyeccion")}
        />
        <PrimaryButton
          title="Cobrar ahora"
          onPress={() => cambiarPantalla("pago")}
          style={{ backgroundColor: Colors.secondary, marginTop: 10 }}
        />
        <PrimaryButton
          title="Cancelar pedido"
          onPress={() => cambiarPantalla("cancelarPedido")}
          style={{
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderColor: Colors.danger,
            marginTop: 10,
          }}
          textStyle={{ color: Colors.danger }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  item: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  nombre: { fontSize: 17, fontWeight: "700", color: Colors.text },
  detalle: { marginTop: 4, color: Colors.textLight, fontSize: 14 },
  subtotalItem: { fontSize: 17, fontWeight: "bold", color: Colors.secondary },
  resumen: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    elevation: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: Colors.textLight, fontSize: 16 },
  value: { fontSize: 16, fontWeight: "600", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  totalLabel: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: "bold", color: Colors.primary },
});
