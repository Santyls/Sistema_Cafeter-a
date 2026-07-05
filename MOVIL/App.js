import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import ClienteMesero from './screens/ClienteMesero';
import Cocina from './screens/Cocina';
import Caja from './screens/Caja';

export default function App() {
  // module: null (menú), 'cliente_mesero', 'cocina', 'caja'
  const [module, setModule] = useState(null);

  const volverAlMenu = () => setModule(null);

  if (module === 'cliente_mesero') return <ClienteMesero onBack={volverAlMenu} />;
  if (module === 'cocina') return <Cocina onBack={volverAlMenu} />;
  if (module === 'caja') return <Caja onBack={volverAlMenu} />;

  // --- MENÚ PRINCIPAL: selección de módulo ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.logo}>☕</Text>
        <Text style={styles.title}>CoffeeFlow</Text>
        <Text style={styles.subtitle}>Selecciona un módulo</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.moduleBtn, { backgroundColor: '#6f4e37' }]}
            onPress={() => setModule('cliente_mesero')}
          >
            <Text style={styles.moduleEmoji}>🧑‍🍽️</Text>
            <Text style={styles.moduleText}>Cliente / Mesero</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.moduleBtn, { backgroundColor: '#4e7c4a' }]}
            onPress={() => setModule('cocina')}
          >
            <Text style={styles.moduleEmoji}>👨‍🍳</Text>
            <Text style={styles.moduleText}>Cocina</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.moduleBtn, { backgroundColor: '#c8893a' }]}
            onPress={() => setModule('caja')}
          >
            <Text style={styles.moduleEmoji}>💵</Text>
            <Text style={styles.moduleText}>Caja</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#3e2b22' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f3ef', padding: 28 },
  logo: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '800', color: '#3e2b22' },
  subtitle: { fontSize: 15, color: '#9b8579', marginTop: 4, marginBottom: 36 },
  buttons: { width: '100%', gap: 16 },
  moduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 22,
    paddingHorizontal: 24,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  moduleEmoji: { fontSize: 30 },
  moduleText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
