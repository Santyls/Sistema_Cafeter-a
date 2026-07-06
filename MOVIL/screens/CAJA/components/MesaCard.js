import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../styles/colors";
import Icon from "../../shared/Icon";

export default function MesaCard({ mesa, estado, tiempo, personas, total, onPress }) {
  const libre = estado === "Libre";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { borderLeftColor: libre ? Colors.success : Colors.danger }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mesa {mesa}</Text>
        <View style={[styles.badge, { backgroundColor: libre ? Colors.libre : Colors.ocupada }]}>
          <Text style={[styles.badgeText, { color: libre ? Colors.success : Colors.danger }]}>
            {estado}
          </Text>
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Icon name="time" size={14} color={Colors.textLight} />
          <Text style={styles.label}> {tiempo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="people" size={14} color={Colors.textLight} />
          <Text style={styles.label}> {personas} personas</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.total}>${total}</Text>
        <Icon name="forward" size={22} color={Colors.secondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 16, borderLeftWidth: 6, elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", color: Colors.text },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontWeight: "700", fontSize: 12 },
  info: { marginTop: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  label: { color: Colors.textLight, fontSize: 15 },
  footer: { marginTop: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  total: { fontSize: 24, fontWeight: "bold", color: Colors.primary },
});
