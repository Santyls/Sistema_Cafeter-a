import React, { useState } from "react";
import {
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

import { API_BASE_URL } from '../../config/api';
const ESTADOS = ["Pendiente", "Recibido", "Cancelado"];

export default function Suministros({ cambiarPantalla, toggleSidebar, token, usuarioLogueado, idCajaActiva }) {
  const [proveedor, setProveedor] = useState("");
  const [monto, setMonto] = useState("");
  const [factura, setFactura] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [listaSuministros, setListaSuministros] = useState([]);

  const getEstadoColor = (estado) => {
    const est = estado ? estado.toLowerCase() : "";
    if (est === "recibido" || est === "completo") return Colors.success;
    if (est === "pendiente") return Colors.warning;
    if (est === "cancelado") return Colors.danger;
    return Colors.textLight;
  };

  const getEstadoBg = (estado) => {
    const est = estado ? estado.toLowerCase() : "";
    if (est === "recibido" || est === "completo") return Colors.libre;
    if (est === "pendiente") return "#FFF8E1";
    if (est === "cancelado") return Colors.ocupada;
    return Colors.background;
  };

  const cargarCompras = () => {
    fetch(`${API_BASE_URL}/compras-suministro`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener compras");
      return res.json();
    })
    .then(data => {
      // Filter by active caja session if available
      const filtrados = idCajaActiva 
        ? data.filter(c => c.id_caja === idCajaActiva)
        : data;
      setListaSuministros(filtrados);
    })
    .catch(err => {
      // Sin datos inventados: si la API falla se muestra la lista vacia.
      console.warn("No se pudieron cargar las compras:", err);
      setListaSuministros([]);
    });
  };

  React.useEffect(() => {
    cargarCompras();
  }, [idCajaActiva]);

  const registrarCompra = () => {
    const parsedMonto = parseFloat(monto);
    if (!proveedor || isNaN(parsedMonto) || !factura || !estadoSeleccionado) return;

    fetch(`${API_BASE_URL}/compras-suministro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_caja: idCajaActiva || 1,
        proveedor: proveedor,
        total: parsedMonto,
        factura: factura,
        estado: estadoSeleccionado.toLowerCase(),
        notas: "Compra de suministros desde App Móvil"
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Error al registrar compra");
      return res.json();
    })
    .then(() => {
      const { Alert } = require('react-native');
      Alert.alert("Éxito", "Compra de suministro registrada en la base de datos.");
      setProveedor("");
      setMonto("");
      setFactura("");
      setEstadoSeleccionado("");
      cargarCompras();
    })
    .catch(err => {
      const { Alert } = require('react-native');
      Alert.alert("Error", "No se pudo guardar en la base de datos, guardado localmente.");
      // Fallback local addition
      const nuevo = {
        id: Date.now(),
        proveedor,
        monto: parsedMonto,
        factura,
        estado: estadoSeleccionado,
        fecha: new Date().toLocaleDateString("es-MX")
      };
      setListaSuministros(prev => [nuevo, ...prev]);
      setProveedor("");
      setMonto("");
      setFactura("");
      setEstadoSeleccionado("");
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Compra de suministros"
        subtitle="Gestion de proveedores"
        onBack={() => cambiarPantalla("inicio")}
        rightAction={{ icon: "menu", onPress: toggleSidebar }}
      />

      <ScrollView contentContainerStyle={styles.body} style={{ backgroundColor: Colors.background }}>
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
            onPress={registrarCompra}
            disabled={!proveedor || !monto || !factura || !estadoSeleccionado}
          />
        </View>

        <Text style={styles.sectionTitle}>Compras recientes</Text>

        {listaSuministros.map((item) => (
          <View key={item.id || item.id_compra} style={styles.suministroCard}>
            <View style={styles.suministroHeader}>
              <View style={styles.suministroIcon}>
                <Icon name="cube" size={20} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.suministroProveedor}>{item.proveedor}</Text>
                <Text style={styles.suministroFactura}>
                  {item.factura} - {item.fecha || item.fecha_envio || "Hoy"}
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
                  {item.estado ? (item.estado.charAt(0).toUpperCase() + item.estado.slice(1)) : "Pendiente"}
                </Text>
              </View>
            </View>
            <View style={styles.suministroFooter}>
              <Text style={styles.suministroMonto}>
                ${(parseFloat(item.total) || parseFloat(item.monto) || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
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
