import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import Colors from "../styles/colors";
import Icon from "../../shared/Icon";

export default function MesaCard({ mesa, estado, tiempo, personas, total, onPress }) {
  const libre = estado === "Libre";
  const esperandoPago = estado === "Esperando Pago";

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let anim = null;
    if (esperandoPago) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: false })
        ])
      );
      anim.start();
    } else {
      pulseAnim.setValue(0);
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [esperandoPago]);

  const animatedBorderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.danger, '#34C759']
  });

  const animatedBg = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.white, '#E8F5E9']
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: esperandoPago ? pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02]
        }) : 1 }]
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[
          styles.card, 
          { 
            borderLeftColor: libre ? Colors.success : (esperandoPago ? '#34C759' : Colors.danger),
            backgroundColor: esperandoPago ? animatedBg : Colors.white,
            borderWidth: esperandoPago ? 2 : 0,
            borderColor: esperandoPago ? animatedBorderColor : 'transparent'
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mesa {mesa}</Text>
          <View style={[
            styles.badge, 
            { 
              backgroundColor: libre ? Colors.libre : (esperandoPago ? 'rgba(78, 141, 112, 0.15)' : Colors.ocupada) 
            }
          ]}>
            <Text style={[
              styles.badgeText, 
              { 
                color: libre ? Colors.success : (esperandoPago ? '#4E8D70' : Colors.danger) 
              }
            ]}>
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
    </Animated.View>
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
