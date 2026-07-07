import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import Icon from "../shared/Icon";

const MOCK_HISTORIAL = [
  { id: "T-001", mesa: 3, total: 350.0, metodoPago: "Efectivo", fecha: "15/03/2024", hora: "14:30", estado: "Pagado", items: 4 },
  { id: "T-002", mesa: 7, total: 520.0, metodoPago: "Tarjeta", fecha: "15/03/2024", hora: "13:15", estado: "Pagado", items: 6 },
  { id: "T-003", mesa: 1, total: 185.5, metodoPago: "Efectivo", fecha: "15/03/2024", hora: "12:00", estado: "Cancelado", items: 2 },
  { id: "T-004", mesa: 5, total: 275.0, metodoPago: "Transferencia", fecha: "15/03/2024", hora: "11:30", estado: "Pagado", items: 3 },
  { id: "T-005", mesa: 2, total: 410.0, metodoPago: "Tarjeta", fecha: "15/03/2024", hora: "10:45", estado: "Pagado", items: 5 },
  { id: "T-006", mesa: 8, total: 95.0, metodoPago: "Efectivo", fecha: "15/03/2024", hora: "09:30", estado: "Cancelado", items: 1 },
];

const FILTROS_ESTADO = ["Todos", "Pagado", "Cancelado"];
const FILTROS_PAGO = ["Todos", "Efectivo", "Tarjeta", "Transferencia"];

export default function HistorialTickets({ cambiarPantalla, toggleSidebar }) {
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroPago, setFiltroPago] = useState("Todos");

  const ticketsFiltrados = MOCK_HISTORIAL.filter((t) => {
    if (filtroEstado !== "Todos" && t.estado !== filtroEstado) return false;
    if (filtroPago !== "Todos" && t.metodoPago !== filtroPago) return false;
    return true;
  });

  const getEstadoColor = (estado) =>
    estado === "Pagado" ? Colors.success : Colors.danger;
  const getEstadoBg = (estado) =>
    estado === "Pagado" ? Colors.libre : Colors.ocupada;
  const getMetodoIcon = (metodo) => {
    switch (metodo) {
      case "Efectivo": return "cash";
      case "Tarjeta": return "card";
      case "Transferencia": return "phone";
      default: return "cash";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Historial de tickets"
        subtitle="Registro de ventas"
        onBack={() => cambiarPantalla("inicio")}
        rightAction={{ icon: "menu", onPress: toggleSidebar }}
      />

      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Estado</Text>
        <View style={styles.filterRow}>
          {FILTROS_ESTADO.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                filtroEstado === f && styles.filterChipActive,
              ]}
              onPress={() => setFiltroEstado(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filtroEstado === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Metodo de pago</Text>
        <View style={styles.filterRow}>
          {FILTROS_PAGO.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                filtroPago === f && styles.filterChipActive,
              ]}
              onPress={() => setFiltroPago(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filtroPago === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={ticketsFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View>
                <Text style={styles.ticketId}>{item.id}</Text>
                <Text style={styles.ticketMesa}>Mesa {item.mesa}</Text>
              </View>
              <View
                style={[
                  styles.estadoBadge,
                  { backgroundColor: getEstadoBg(item.estado) },
                ]}
              >
                <Text
                  style={[
                    styles.estadoText,
                    { color: getEstadoColor(item.estado) },
                  ]}
                >
                  {item.estado}
                </Text>
              </View>
            </View>
            <View style={styles.ticketBody}>
              <View style={styles.ticketInfo}>
                <Icon name="calendar" size={14} color={Colors.textLight} />
                <Text style={styles.ticketInfoText}>
                  {" "}
                  {item.fecha} {item.hora}
                </Text>
              </View>
              <View style={styles.ticketInfo}>
                <Icon
                  name={getMetodoIcon(item.metodoPago)}
                  size={14}
                  color={Colors.textLight}
                />
                <Text style={styles.ticketInfoText}> {item.metodoPago}</Text>
              </View>
              <View style={styles.ticketInfo}>
                <Icon name="list" size={14} color={Colors.textLight} />
                <Text style={styles.ticketInfoText}>
                  {" "}
                  {item.items} productos
                </Text>
              </View>
            </View>
            <View style={styles.ticketFooter}>
              <Text style={styles.ticketTotal}>
                ${item.total.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="receipt" size={40} color={Colors.textLight} />
            <Text style={styles.emptyText}>
              No hay tickets con estos filtros
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filtersSection: { paddingHorizontal: 20, paddingTop: 15 },
  filterLabel: {
    color: Colors.text,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
  },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: { fontSize: 13, color: Colors.textLight, fontWeight: "600" },
  filterTextActive: { color: Colors.white },
  ticketCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ticketId: { fontSize: 17, fontWeight: "bold", color: Colors.text },
  ticketMesa: { color: Colors.textLight, fontSize: 13, marginTop: 2 },
  estadoBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  estadoText: { fontSize: 12, fontWeight: "700" },
  ticketBody: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  ticketInfo: { flexDirection: "row", alignItems: "center" },
  ticketInfoText: { color: Colors.textLight, fontSize: 13 },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    alignItems: "flex-end",
  },
  ticketTotal: { fontSize: 20, fontWeight: "bold", color: Colors.primary },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: Colors.textLight, fontSize: 15, marginTop: 12 },
});
