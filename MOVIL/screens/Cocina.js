import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Módulo Cocina - pendiente de desarrollo por el equipo.
export default function Cocina({ onBack }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.emoji}>👨‍🍳</Text>
        <Text style={styles.title}>Módulo Cocina</Text>
        <Text style={styles.subtitle}>En construcción</Text>

        {onBack && (
          <TouchableOpacity style={styles.btn} onPress={onBack}>
            <Text style={styles.btnText}>← Volver al menú</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#6f4e37' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f3ef', padding: 24 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#3e2b22' },
  subtitle: { fontSize: 15, color: '#9b8579', marginTop: 6 },
  btn: { marginTop: 32, backgroundColor: '#6f4e37', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
