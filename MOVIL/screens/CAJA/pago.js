import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import PaymentOption from "./components/PaymentOption";
import PrimaryButton from "./components/PrimaryButton";

export default function Pago({
  total,
  metodoPago,
  setMetodoPago,
  montoRecibido,
  setMontoRecibido,
  cambio,
  cambiarPantalla,
}) {
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Metodo de pago"
        subtitle={`Total: $${total.toFixed(2)}`}
        onBack={() => cambiarPantalla("confirmar")}
      />

      <ScrollView contentContainerStyle={styles.body}>
        <PaymentOption
          icon="cash"
          title="Efectivo"
          subtitle="Pago en efectivo"
          selected={metodoPago === "efectivo"}
          onPress={() => setMetodoPago("efectivo")}
        />
        <PaymentOption
          icon="card"
          title="Tarjeta"
          subtitle="Debito o credito"
          selected={metodoPago === "tarjeta"}
          onPress={() => setMetodoPago("tarjeta")}
        />
        <PaymentOption
          icon="phone"
          title="Transferencia"
          subtitle="SPEI / CoDi"
          selected={metodoPago === "transferencia"}
          onPress={() => setMetodoPago("transferencia")}
        />

        {metodoPago === "efectivo" && (
          <View style={styles.efectivoSection}>
            <Text style={styles.label}>Monto recibido</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="$0.00"
              value={montoRecibido}
              onChangeText={setMontoRecibido}
            />
            <View style={styles.cambioBox}>
              <Text style={styles.cambioLabel}>Cambio</Text>
              <Text style={styles.cambioValue}>${cambio.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <PrimaryButton
          title="Confirmar pago"
          onPress={() => cambiarPantalla("exitoso")}
          disabled={!metodoPago}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { padding: 20, paddingBottom: 40 },
  efectivoSection: { marginBottom: 20 },
  label: { color: Colors.text, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 15,
  },
  cambioBox: {
    backgroundColor: Colors.libre,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cambioLabel: { fontSize: 16, color: Colors.text, fontWeight: "600" },
  cambioValue: { fontSize: 22, fontWeight: "bold", color: Colors.success },
});
