import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

import Colors from "./styles/colors";
import Icon from "../shared/Icon";
import PrimaryButton from "./components/PrimaryButton";

export default function Exitoso({
  mesa,
  total,
  metodoPago,
  cambio,
  limpiarPedido,
  cambiarPantalla,
}) {
  const metodoTexto =
    metodoPago === "efectivo"
      ? "Efectivo"
      : metodoPago === "tarjeta"
      ? "Tarjeta"
      : "Transferencia";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name="check-circle" size={60} color={Colors.success} />
        </View>
        <Text style={styles.title}>Pago exitoso!</Text>
        <Text style={styles.subtitle}>
          El cobro de la Mesa {mesa.numero} se realizo correctamente
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Mesa</Text>
            <Text style={styles.value}>{mesa.numero}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total cobrado</Text>
            <Text style={styles.value}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Metodo</Text>
            <Text style={styles.value}>{metodoTexto}</Text>
          </View>
          {metodoPago === "efectivo" && (
            <View style={styles.row}>
              <Text style={styles.label}>Cambio</Text>
              <Text style={[styles.value, { color: Colors.success }]}>
                ${cambio.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        <PrimaryButton
          title="Volver a mesas"
          onPress={() => {
            limpiarPedido();
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
    fontSize: 30,
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
    marginBottom: 14,
  },
  label: { color: Colors.textLight, fontSize: 16 },
  value: { fontSize: 16, fontWeight: "700", color: Colors.text },
});
