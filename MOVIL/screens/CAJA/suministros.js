import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import Icon from "../shared/Icon";
import PrimaryButton from "./components/PrimaryButton";

const ESTADOS = ["Pendiente", "Recibido", "Cancelado"];

const MOCK_SUMINISTROS = [
  { id: 1, proveedor: "Cafe Premium SA", monto: 2500.0, factura: "FAC-2024-001", estado: "Recibido", fecha: "15/03/2024" },
  { id: 2, proveedor: "Lacteos del Norte", monto: 850.0, factura: "FAC-2024-002", estado: "Pendiente", fecha: "14/03/2024" },
  { id: 3, proveedor: "Panaderia Artesanal", monto: 1200.0, factura: "FAC-2024-003", estado: "Recibido", fecha: "13/03/2024" },
];

export default function Suministros({ cambiarPantalla, toggleSidebar }) {
  const [proveedor, setProveedor] = useState("");
  const [monto, setMonto] = useState("");
  const [factura, setFactura] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Recibido": return Colors.success;
      case "Pendiente": return Colors.warning;
      case "Cancelado": return Colors.danger;
      default: return Colors.textLight;
    }
  };

  const getEstadoBg = (estado) => {
    switch (estado) {
      case "Recibido": return Colors.libre;
      case "Pendiente": return "#FFF8E1";
      case "Cancelado": return Colors.ocupada;
      default: return Colors.background;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Compra de suministros"
        subtitle="Gestion de proveedores"
        onBack={() => cambiarPantalla("inicio")}
        rightAction={{ icon: "menu", onPress: toggleSidebar }}
      />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nueva compra</Text>

          <Text style={styles.label}>Proveedor</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del proveedor"
            value={proveedor}
            onChangeText={setProveedor}
          />

          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="$0.00"
            value={monto}
            onChangeText={setMonto}
          />

          <Text style={styles.label}>No. Factura</Text>
          <TextInput
            style={styles.input}
            placeholder="FAC-2024-000"
            value={factura}
            onChangeText={setFactura}
          />

          <Text style={styles.label}>Estado</Text>
          <View style={styles.estadosRow}>
            {ESTADOS.map((est) => (
              <TouchableOpacity
                key={est}
                style={[
                  styles.estadoChip,
                  estadoSeleccionado === est && {
                    backgroundColor: getEstadoColor(est),
                    borderColor: getEstadoColor(est),
                  },
                ]}
                onPress={() => setEstadoSeleccionado(est)}
              >
                <Text
                  style={[
                    styles.estadoText,
                    estadoSeleccionado === est && { color: Colors.white },
                  ]}
                >
                  {est}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <PrimaryButton
            title="Registrar compra"
            onPress={() => {
              setProveedor("");
              setMonto("");
              setFactura("");
              setEstadoSeleccionado("");
            }}
            disabled={!proveedor || !monto || !factura || !estadoSeleccionado}
          />
        </View>

        <Text style={styles.sectionTitle}>Compras recientes</Text>

        {MOCK_SUMINISTROS.map((item) => (
          <View key={item.id} style={styles.suministroCard}>
            <View style={styles.suministroHeader}>
              <View style={styles.suministroIcon}>
                <Icon name="cube" size={20} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.suministroProveedor}>{item.proveedor}</Text>
                <Text style={styles.suministroFactura}>
                  {item.factura} - {item.fecha}
                </Text>
              </View>
              <View
                style={[
                  styles.estadoBadge,
                  { backgroundColor: getEstadoBg(item.estado) },
                ]}
              >
                <Text
                  style={[
                    styles.estadoBadgeText,
                    { color: getEstadoColor(item.estado) },
                  ]}
                >
                  {item.estado}
                </Text>
              </View>
            </View>
            <View style={styles.suministroFooter}>
              <Text style={styles.suministroMonto}>
                ${item.monto.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { padding: 20, paddingBottom: 40 },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    marginBottom: 25,
    elevation: 5,
  },
  formTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, marginBottom: 16 },
  label: { color: Colors.text, fontWeight: "600", marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  estadosRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  estadoChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  estadoText: { fontSize: 14, color: Colors.textLight, fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, marginBottom: 14 },
  suministroCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  suministroHeader: { flexDirection: "row", alignItems: "center" },
  suministroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F0EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  suministroProveedor: { fontSize: 15, fontWeight: "700", color: Colors.text },
  suministroFactura: { color: Colors.textLight, fontSize: 12, marginTop: 3 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  estadoBadgeText: { fontSize: 12, fontWeight: "700" },
  suministroFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: "flex-end",
  },
  suministroMonto: { fontSize: 18, fontWeight: "bold", color: Colors.primary },
});
