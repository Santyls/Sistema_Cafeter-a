import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../styles/colors";

export default function ProductoItem({ nombre, precio, cantidad, onAgregar, onQuitar }) {
  const subtotal = precio * cantidad;

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.precio}>${precio.toFixed(2)}</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={onQuitar}>
            <Text style={styles.buttonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.cantidad}>{cantidad}</Text>
          <TouchableOpacity style={styles.button} onPress={onAgregar}>
            <Text style={styles.buttonText}>＋</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtotal}>${subtotal.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", elevation: 3 },
  info: { flex: 1 },
  nombre: { fontSize: 18, fontWeight: "700", color: Colors.text },
  precio: { marginTop: 5, color: Colors.textLight, fontSize: 15 },
  right: { alignItems: "center" },
  controls: { flexDirection: "row", alignItems: "center" },
  button: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  buttonText: { color: Colors.white, fontWeight: "bold", fontSize: 20 },
  cantidad: { width: 40, textAlign: "center", fontSize: 18, fontWeight: "700", color: Colors.text },
  subtotal: { marginTop: 10, fontSize: 17, fontWeight: "bold", color: Colors.secondary },
});
