import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import MesaCard from "./components/MesaCard";

export default function Inicio({ mesas, cambiarPantalla, seleccionarMesa, toggleSidebar }) {
  const [busqueda, setBusqueda] = useState("");

  const mesasFiltradas = mesas.filter((m) =>
    `Mesa ${m.numero}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="CoffeeFlow &bull; Panel de Caja"
        subtitle="Bienvenido, Cajero"
        rightAction={{ icon: "menu", onPress: toggleSidebar }}
      />

      <View style={styles.body}>
        <TextInput
          style={styles.search}
          placeholder="Buscar mesa..."
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <FlatList
          data={mesasFiltradas}
          keyExtractor={(item) => item.numero.toString()}
          renderItem={({ item }) => (
            <MesaCard
              mesa={item.numero}
              estado={item.estado}
              tiempo={item.tiempo}
              personas={item.personas}
              total={item.total}
              onPress={() => {
                seleccionarMesa(item);
                cambiarPantalla("pedido");
              }}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, paddingHorizontal: 20 },
  search: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
    elevation: 3,
  },
});
