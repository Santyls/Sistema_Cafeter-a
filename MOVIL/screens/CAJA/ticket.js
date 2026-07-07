import React from "react";
import { SafeAreaView, View, Text, ScrollView, StyleSheet } from "react-native";

import Colors from "./styles/colors";
import Icon from "../shared/Icon";
import PrimaryButton from "./components/PrimaryButton";

export default function Ticket({
  mesa,
  pedido,
  subtotal,
  iva,
  total,
  metodoPago,
  cambiarPantalla,
  limpiarPedido,
}) {
  const metodoTexto =
    metodoPago === "efectivo"
      ? "Efectivo"
      : metodoPago === "tarjeta"
      ? "Tarjeta"
      : "Transferencia";

  const folio = `T-${Date.now().toString().slice(-6)}`;
  const fecha = new Date().toLocaleDateString("es-MX");
  const hora = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Icon name="coffee" size={28} color={Colors.primary} />
            <Text style={styles.storeName}>CoffeeFlow</Text>
            <Text style={styles.ticketSubtitle}>Ticket de venta</Text>
          </View>

          <View style={styles.dividerDashed} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Folio</Text>
              <Text style={styles.infoValue}>{folio}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mesa</Text>
              <Text style={styles.infoValue}>{mesa?.numero}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>{fecha}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hora</Text>
              <Text style={styles.infoValue}>{hora}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cajero</Text>
              <Text style={styles.infoValue}>Carlos Lopez</Text>
            </View>
          </View>

          <View style={styles.dividerDashed} />

          <View style={styles.itemsSection}>
            <View style={styles.itemHeaderRow}>
              <Text style={styles.itemHeaderText}>Producto</Text>
              <Text style={styles.itemHeaderText}>Importe</Text>
            </View>
            {pedido.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.cantidad}x {item.nombre}
                </Text>
                <Text style={styles.itemTotal}>
                  ${(item.cantidad * item.precio).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.dividerDashed} />

          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (16%)</Text>
              <Text style={styles.totalValue}>${iva.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Metodo de pago</Text>
              <Text style={styles.totalValue}>{metodoTexto}</Text>
            </View>
          </View>

          <View style={styles.dividerDashed} />

          <Text style={styles.footerText}>Gracias por su visita</Text>
        </View>

        <PrimaryButton
          title="Volver a mesas"
          onPress={() => {
            if (limpiarPedido) limpiarPedido();
            cambiarPantalla("inicio");
          }}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { padding: 20, paddingBottom: 40 },
  ticketCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  ticketHeader: { alignItems: "center", marginBottom: 5 },
  storeName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 8,
  },
  ticketSubtitle: { color: Colors.textLight, fontSize: 14, marginTop: 4 },
  dividerDashed: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.border,
    marginVertical: 16,
  },
  infoSection: {},
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: { color: Colors.textLight, fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "600", color: Colors.text },
  itemsSection: {},
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemHeaderText: {
    color: Colors.textLight,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemName: { color: Colors.text, fontSize: 15 },
  itemTotal: { fontSize: 15, fontWeight: "600", color: Colors.text },
  totalsSection: {},
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: { color: Colors.textLight, fontSize: 15 },
  totalValue: { fontSize: 15, fontWeight: "600", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  grandTotalLabel: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  grandTotalValue: { fontSize: 20, fontWeight: "bold", color: Colors.primary },
  footerText: {
    textAlign: "center",
    color: Colors.textLight,
    fontSize: 14,
    fontStyle: "italic",
  },
});
