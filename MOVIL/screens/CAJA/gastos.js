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

const CATEGORIAS = ["Operacion", "Mantenimiento", "Insumos", "Otros"];

const MOCK_GASTOS = [
  { id: 1, concepto: "Limpieza general", monto: 150.0, categoria: "Operacion", fecha: "15/03/2024 09:00" },
  { id: 2, concepto: "Reparacion cafetera", monto: 350.0, categoria: "Mantenimiento", fecha: "15/03/2024 10:30" },
  { id: 3, concepto: "Servilletas y desechables", monto: 85.0, categoria: "Insumos", fecha: "15/03/2024 11:00" },
];

export default function Gastos({ cambiarPantalla, toggleSidebar }) {
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Registro de gastos"
        subtitle="Control financiero"
        onBack={() => cambiarPantalla("inicio")}
        rightAction={{ icon: "menu", onPress: toggleSidebar }}
      />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nuevo gasto</Text>

          <Text style={styles.label}>Concepto</Text>
          <TextInput
            style={styles.input}
            placeholder="Descripcion del gasto"
            value={concepto}
            onChangeText={setConcepto}
          />

          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="$0.00"
            value={monto}
            onChangeText={setMonto}
          />

          <Text style={styles.label}>Categoria</Text>
          <View style={styles.categoriasRow}>
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoriaChip,
                  categoriaSeleccionada === cat && styles.categoriaChipActive,
                ]}
                onPress={() => setCategoriaSeleccionada(cat)}
              >
                <Text
                  style={[
                    styles.categoriaText,
                    categoriaSeleccionada === cat && styles.categoriaTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <PrimaryButton
            title="Registrar gasto"
            onPress={() => {
              setConcepto("");
              setMonto("");
              setCategoriaSeleccionada("");
            }}
            disabled={!concepto || !monto || !categoriaSeleccionada}
          />
        </View>

        <Text style={styles.sectionTitle}>Gastos del dia</Text>

        {MOCK_GASTOS.map((gasto) => (
          <View key={gasto.id} style={styles.gastoCard}>
            <View style={styles.gastoLeft}>
              <View style={styles.gastoIcon}>
                <Icon name="receipt" size={20} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gastoConcepto}>{gasto.concepto}</Text>
                <Text style={styles.gastoInfo}>
                  {gasto.categoria} - {gasto.fecha}
                </Text>
              </View>
            </View>
            <Text style={styles.gastoMonto}>-${gasto.monto.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totalCard}>
          <Text style={styles.totalCardLabel}>Total gastos del dia</Text>
          <Text style={styles.totalCardValue}>
            -${MOCK_GASTOS.reduce((s, g) => s + g.monto, 0).toFixed(2)}
          </Text>
        </View>
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
  categoriasRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  categoriaChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  categoriaChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoriaText: { fontSize: 14, color: Colors.textLight, fontWeight: "600" },
  categoriaTextActive: { color: Colors.white },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, marginBottom: 14 },
  gastoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  gastoLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  gastoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F0EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  gastoConcepto: { fontSize: 15, fontWeight: "700", color: Colors.text },
  gastoInfo: { color: Colors.textLight, fontSize: 12, marginTop: 3 },
  gastoMonto: { fontSize: 16, fontWeight: "bold", color: Colors.danger },
  totalCard: {
    backgroundColor: Colors.ocupada,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  totalCardLabel: { fontSize: 16, fontWeight: "600", color: Colors.text },
  totalCardValue: { fontSize: 20, fontWeight: "bold", color: Colors.danger },
});
