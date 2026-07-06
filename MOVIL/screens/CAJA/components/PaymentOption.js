import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Colors from "../styles/colors";
import Icon from "../../shared/Icon";

export default function PaymentOption({ icon, title, subtitle, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.container, selected && styles.selected]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={24} color={Colors.secondary} />
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={[styles.circle, selected && styles.circleSelected]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.white, borderRadius: 18, padding: 18, marginBottom: 15, borderWidth: 2, borderColor: Colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center", elevation: 3 },
  selected: { borderColor: Colors.secondary },
  left: { flexDirection: "row", alignItems: "center" },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F5F0EB", justifyContent: "center", alignItems: "center", marginRight: 15 },
  title: { fontSize: 18, fontWeight: "700", color: Colors.text },
  subtitle: { marginTop: 4, color: Colors.textLight, fontSize: 13 },
  circle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.gray300 },
  circleSelected: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
});
