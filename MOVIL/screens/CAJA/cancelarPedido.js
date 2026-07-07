import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import Icon from "../shared/Icon";
import PrimaryButton from "./components/PrimaryButton";

export default function CancelarPedido({
  mesa,
  pedido,
  total,
  cambiarPantalla,
  onCancelar,
}) {
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Cancelar pedido"
        subtitle={`Mesa ${mesa?.numero}`}
        onBack={() => cambiarPantalla("confirmar")}
      />

      <View style={styles.body}>
        <View style={styles.warningCard}>
          <Icon name="warning" size={40} color={Colors.warning} />
          <Text style={styles.warningTitle}>Estas seguro?</Text>
          <Text style={styles.warningText}>
            Esta accion cancelara el pedido completo de la Mesa {mesa?.numero} y
            no se puede deshacer.
          </Text>
        </View>

        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitle}>Resumen del pedido</Text>
          {pedido.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.cantidad}x {item.nombre}
              </Text>
              <Text style={styles.itemPrice}>
                ${(item.cantidad * item.precio).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total a cancelar</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <PrimaryButton
          title="Confirmar cancelacion"
          onPress={() => {
            if (onCancelar) onCancelar();
            cambiarPantalla("inicio");
          }}
          style={{ backgroundColor: Colors.danger }}
        />

        <PrimaryButton
          title="Volver al pedido"
          onPress={() => cambiarPantalla("confirmar")}
          style={{
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: Colors.primary,
            marginTop: 12,
          }}
          textStyle={{ color: Colors.primary }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, padding: 20 },
  warningCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 12,
  },
  warningText: {
    textAlign: "center",
    color: Colors.textLight,
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  resumenCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
  },
  resumenTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemName: { color: Colors.textLight, fontSize: 15 },
  itemPrice: { fontSize: 15, fontWeight: "600", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  totalLabel: { fontSize: 17, fontWeight: "bold", color: Colors.text },
  totalValue: { fontSize: 17, fontWeight: "bold", color: Colors.danger },
});
