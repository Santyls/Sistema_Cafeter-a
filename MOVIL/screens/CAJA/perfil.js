import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

import Colors from "./styles/colors";
import Icon from "../shared/Icon";
import Header from "./components/Header";
import PrimaryButton from "./components/PrimaryButton";

export default function Perfil({ cambiarPantalla }) {
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Mi perfil"
        subtitle="Informacion del cajero"
        onBack={() => cambiarPantalla("inicio")}
      />

      <View style={styles.body}>
        <View style={styles.avatar}>
          <Icon name="person" size={50} color={Colors.secondary} />
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>Carlos Lopez</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Usuario</Text>
            <Text style={styles.value}>cajero1</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.value}>Cajero</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Turno</Text>
            <Text style={styles.value}>Matutino</Text>
          </View>
        </View>

        <PrimaryButton
          title="Cerrar sesion"
          onPress={() => cambiarPantalla("login")}
          style={{ backgroundColor: Colors.danger }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, padding: 25 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 25,
    elevation: 5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    marginBottom: 30,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { color: Colors.textLight, fontSize: 16 },
  value: { fontSize: 16, fontWeight: "700", color: Colors.text },
});
