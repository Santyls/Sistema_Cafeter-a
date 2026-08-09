import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "./styles/colors";
import Header from "./components/Header";
import ProductoItem from "./components/ProductoItem";
import PrimaryButton from "./components/PrimaryButton";

const PulsingBorderView = ({ children }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false
        })
      ])
    );
    anim.start();
    return () => {
      anim.stop();
    };
  }, [animatedValue]);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 122, 255, 0.2)', 'rgba(0, 122, 255, 1)']
  });

  const borderWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5]
  });

  return (
    <Animated.View style={[styles.summaryItemRow, { borderColor, borderWidth, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 6 }]}>
      {children}
    </Animated.View>
  );
};

export default function Pedido({
  mesa,
  productos,
  pedido,
  subtotal,
  iva,
  total,
  agregarProducto,
  quitarProducto,
  cambiarPantalla,
  onDeleteItem,
  cancelledItemsToHighlight,
}) {
  return (
    <View style={styles.container}>
      <Header
        title={`Mesa ${mesa ? (mesa.numero || mesa.id || '') : 'N/A'}`}
        subtitle="Resumen de cuenta a cobrar"
        onBack={() => cambiarPantalla("inicio")}
      />

      <FlatList
        data={pedido}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isCancelled = (cancelledItemsToHighlight || []).includes(item.nombre);
          
          const innerContent = (
            <>
              <View style={styles.summaryItemLeft}>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyText}>{item.cantidad}x</Text>
                </View>
                <Text style={styles.itemNameText}>{item.nombre}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Text style={styles.itemPriceText}>
                  ${(item.cantidad * item.precio).toFixed(2)}
                </Text>
                {onDeleteItem && (
                  <TouchableOpacity onPress={() => onDeleteItem(item)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            </>
          );

          if (isCancelled) {
            return <PulsingBorderView>{innerContent}</PulsingBorderView>;
          }

          return (
            <View style={styles.summaryItemRow}>
              {innerContent}
            </View>
          );
        }}
        style={{ backgroundColor: Colors.background }}
        contentContainerStyle={{ padding: 20, paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.resumen}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>IVA (16%)</Text>
          <Text style={styles.value}>${iva.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <PrimaryButton
          title="Proceder al Pago"
          onPress={() => cambiarPantalla("confirmar")}
          disabled={pedido.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  resumen: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    elevation: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: Colors.textLight, fontSize: 16 },
  value: { fontSize: 16, fontWeight: "600", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  totalLabel: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: "bold", color: Colors.primary },
  summaryItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qtyText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  itemNameText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  itemPriceText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },
});
