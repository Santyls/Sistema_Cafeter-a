import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Colors from "../styles/colors";
import Icon from "../../shared/Icon";

export default function BottomTab({ active = "Caja", onCaja, onCocina, onMesero }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={onCaja}>
        <Icon name="cash" size={22} color={active === "Caja" ? Colors.secondary : Colors.textLight} />
        <Text style={[styles.label, active === "Caja" && styles.active]}>Caja</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={onCocina}>
        <Icon name="flame" size={22} color={active === "Cocina" ? Colors.secondary : Colors.textLight} />
        <Text style={[styles.label, active === "Cocina" && styles.active]}>Cocina</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={onMesero}>
        <Icon name="restaurant" size={22} color={active === "Mesero" ? Colors.secondary : Colors.textLight} />
        <Text style={[styles.label, active === "Mesero" && styles.active]}>Mesero</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: Colors.white, paddingVertical: 12, borderTopWidth: 1, borderColor: Colors.border, elevation: 10 },
  item: { alignItems: "center" },
  label: { marginTop: 3, fontSize: 13, color: Colors.textLight },
  active: { color: Colors.secondary, fontWeight: "700" },
});
