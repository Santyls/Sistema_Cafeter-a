import React from "react";
import { SafeAreaView, View, Text, ScrollView, StyleSheet } from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import Icon from "../shared/Icon";
import PrimaryButton from "./components/PrimaryButton";

const MOCK_CORTE = {
  fondoInicial: 1000.0,
  ventas: { efectivo: 2350.0, tarjeta: 1850.0, transferencia: 720.0 },
  totalVentas: 4920.0,
  totalGastos: 585.0,
  ticketsEmitidos: 18,
  ticketsCancelados: 2,
};

export default function CorteCaja({ cambiarPantalla, toggleSidebar }) {
  const totalEnCaja =
    MOCK_CORTE.fondoInicial +
    MOCK_CORTE.ventas.efectivo -
    MOCK_CORTE.totalGastos;
  const diferencia = 0;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Corte de caja"
        subtitle="Resumen del turno"
        onBack={() => cambiarPantalla("inicio")}
        rightAction={{ icon: "menu", onPress: toggleSidebar }}
      />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.libre }]}>
            <Icon name="cash" size={22} color={Colors.success} />
            <Text style={styles.summaryValue}>
              ${MOCK_CORTE.totalVentas.toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>Total ventas</Text>
          </View>
          <View
            style={[styles.summaryCard, { backgroundColor: Colors.ocupada }]}
          >
            <Icon name="receipt" size={22} color={Colors.danger} />
            <Text style={styles.summaryValue}>
              ${MOCK_CORTE.totalGastos.toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>Total gastos</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ventas por metodo de pago</Text>
          <View style={styles.payRow}>
            <View style={styles.payLeft}>
              <Icon name="cash" size={18} color={Colors.secondary} />
              <Text style={styles.payLabel}> Efectivo</Text>
            </View>
            <Text style={styles.payValue}>
              ${MOCK_CORTE.ventas.efectivo.toFixed(2)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <View style={styles.payLeft}>
              <Icon name="card" size={18} color={Colors.secondary} />
              <Text style={styles.payLabel}> Tarjeta</Text>
            </View>
            <Text style={styles.payValue}>
              ${MOCK_CORTE.ventas.tarjeta.toFixed(2)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <View style={styles.payLeft}>
              <Icon name="phone" size={18} color={Colors.secondary} />
              <Text style={styles.payLabel}> Transferencia</Text>
            </View>
            <Text style={styles.payValue}>
              ${MOCK_CORTE.ventas.transferencia.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.payRow}>
            <Text style={styles.payTotalLabel}>Total ventas</Text>
            <Text style={styles.payTotalValue}>
              ${MOCK_CORTE.totalVentas.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen de caja</Text>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Fondo inicial</Text>
            <Text style={styles.payValue}>
              ${MOCK_CORTE.fondoInicial.toFixed(2)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Ventas en efectivo</Text>
            <Text style={[styles.payValue, { color: Colors.success }]}>
              +${MOCK_CORTE.ventas.efectivo.toFixed(2)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Gastos</Text>
            <Text style={[styles.payValue, { color: Colors.danger }]}>
              -${MOCK_CORTE.totalGastos.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.payRow}>
            <Text style={styles.payTotalLabel}>Efectivo en caja</Text>
            <Text style={styles.payTotalValue}>
              ${totalEnCaja.toFixed(2)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Diferencia</Text>
            <Text
              style={[
                styles.payValue,
                { color: diferencia === 0 ? Colors.success : Colors.danger },
              ]}
            >
              ${diferencia.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tickets</Text>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Emitidos</Text>
            <Text style={styles.payValue}>{MOCK_CORTE.ticketsEmitidos}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Cancelados</Text>
            <Text style={[styles.payValue, { color: Colors.danger }]}>
              {MOCK_CORTE.ticketsCancelados}
            </Text>
          </View>
        </View>

        <PrimaryButton
          title="Cerrar turno"
          onPress={() => cambiarPantalla("login")}
          style={{ backgroundColor: Colors.danger, marginTop: 10 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { padding: 20, paddingBottom: 40 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    elevation: 3,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
  },
  summaryLabel: { color: Colors.textLight, fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  payLeft: { flexDirection: "row", alignItems: "center" },
  payLabel: { color: Colors.textLight, fontSize: 15 },
  payValue: { fontSize: 15, fontWeight: "600", color: Colors.text },
  payTotalLabel: { fontSize: 17, fontWeight: "bold", color: Colors.text },
  payTotalValue: { fontSize: 17, fontWeight: "bold", color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
});
