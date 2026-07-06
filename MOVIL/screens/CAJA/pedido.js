import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import ProductoItem from "./components/ProductoItem";
import PrimaryButton from "./components/PrimaryButton";

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
}) {
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={`Mesa ${mesa.numero}`}
        subtitle="Agregar productos al pedido"
        onBack={() => cambiarPantalla("inicio")}
      />

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
        renderItem={({ item }) => {
          const enPedido = pedido.find((p) => p.id === item.id);
          const cantidad = enPedido ? enPedido.cantidad : 0;
          return (
            <ProductoItem
              nombre={item.nombre}
              precio={item.precio}
              cantidad={cantidad}
              onAgregar={() => agregarProducto(item)}
              onQuitar={() => quitarProducto(item.id)}
            />
          );
        }}
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
          title="Confirmar pedido"
          onPress={() => cambiarPantalla("confirmar")}
          disabled={pedido.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
});
