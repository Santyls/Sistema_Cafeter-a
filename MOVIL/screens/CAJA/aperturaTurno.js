import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import PrimaryButton from "./components/PrimaryButton";
import Icon from "../shared/Icon";

import { API_BASE_URL } from '../../config/api';
export default function AperturaTurno({ cambiarPantalla, token, onTurnoAbierto, usuarioLogueado }) {
  // Nombre real del cajero que inicio sesion en el login unificado.
  const nombreCajero = usuarioLogueado
    ? `${usuarioLogueado.nombre} ${usuarioLogueado.apellido_paterno || ''}`.trim()
    : 'Cajero';

  const [fondoInicial, setFondoInicial] = useState("");

  const fecha = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const hora = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      <Header title="Apertura de turno" subtitle="Configuracion inicial" />

      <ScrollView contentContainerStyle={styles.body} style={{ backgroundColor: Colors.background }}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="person" size={20} color={Colors.secondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Cajero</Text>
              <Text style={styles.infoValue}>{nombreCajero}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color={Colors.secondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>{fecha}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Icon name="time" size={20} color={Colors.secondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Hora de inicio</Text>
              <Text style={styles.infoValue}>{hora}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Fondo inicial de caja</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="$0.00"
          value={fondoInicial}
          onChangeText={setFondoInicial}
        />
        <Text style={styles.hint}>
          Ingresa el monto con el que inicias tu turno
        </Text>

        <PrimaryButton
          title="Abrir turno"
          onPress={() => {
            const { Alert } = require('react-native');
            fetch(`${API_BASE_URL}/caja`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                fondo_inicial: parseFloat(fondoInicial) || 0,
                observaciones: "Turno iniciado desde App Móvil"
              })
            })
            .then(res => {
              if (!res.ok) throw new Error('Error al abrir turno');
              return res.json();
            })
            .then(data => {
              if (onTurnoAbierto) onTurnoAbierto(data.id_caja);
              cambiarPantalla("inicio");
            })
            .catch(err => {
              console.warn(err);
              // Fallback to offline mode
              if (onTurnoAbierto) onTurnoAbierto(1); // dummy ID
              cambiarPantalla("inicio");
            });
          }}
          disabled={!fondoInicial}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  body: { padding: 20, paddingBottom: 40 },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    marginBottom: 30,
    elevation: 5,
  },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  infoText: { marginLeft: 15 },
  infoLabel: { color: Colors.textLight, fontSize: 13 },
  infoValue: { fontSize: 16, fontWeight: "700", color: Colors.text, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, marginBottom: 12 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    fontSize: 22,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    textAlign: "center",
  },
  hint: { color: Colors.textLight, fontSize: 13, textAlign: "center", marginBottom: 30 },
});
