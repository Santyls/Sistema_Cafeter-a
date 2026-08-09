import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import Colors from "./styles/colors";
import Header from "./components/Header";
import Icon from "../shared/Icon";
import PrimaryButton from "./components/PrimaryButton";

import { API_BASE_URL } from '../../config/api';
const CORTE_VACIO = {
  fondoInicial: 0.0,
  ventas: { efectivo: 0.0, tarjeta: 0.0, transferencia: 0.0 },
  totalVentas: 0.0,
  totalGastos: 0.0,
  ticketsEmitidos: 0,
  ticketsCancelados: 0,
};

export default function CorteCaja({ cambiarPantalla, toggleSidebar, token, usuarioLogueado, idCajaActiva }) {
  const [corte, setCorte] = React.useState({
    fondoInicial: 0.0,
    ventas: { efectivo: 0.0, tarjeta: 0.0, transferencia: 0.0 },
    totalVentas: 0.0,
    totalGastos: 0.0,
    ticketsEmitidos: 0,
    ticketsCancelados: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!idCajaActiva) {
      setCorte(CORTE_VACIO);
      setLoading(false);
      return;
    }

    // Load Caja Info
    const fetchCaja = fetch(`${API_BASE_URL}/caja/${idCajaActiva}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());

    // Load Tickets
    const fetchTickets = fetch(`${API_BASE_URL}/tickets?id_caja=${idCajaActiva}&with_pagos=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());

    // Load Gastos
    const fetchGastos = fetch(`${API_BASE_URL}/gastos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());

    Promise.all([fetchCaja, fetchTickets, fetchGastos])
      .then(([cajaData, ticketsData, gastosData]) => {
        const fondo = parseFloat(cajaData.fondo_inicial) || 0.0;
        
        let efectivo = 0.0;
        let tarjeta = 0.0;
        let transferencia = 0.0;
        let emitidos = 0;
        let cancelados = 0;

        if (Array.isArray(ticketsData)) {
          ticketsData.forEach(t => {
            if (t.estado === "cancelado") {
              cancelados++;
            } else {
              emitidos++;
              if (Array.isArray(t.pagos)) {
                t.pagos.forEach(p => {
                  const tipo = (p.tipo_pago || "").toLowerCase();
                  if (tipo.includes("efectivo")) efectivo += parseFloat(p.monto) || 0;
                  else if (tipo.includes("tarjeta")) tarjeta += parseFloat(p.monto) || 0;
                  else transferencia += parseFloat(p.monto) || 0;
                });
              }
            }
          });
        }

        const filtradosGastos = Array.isArray(gastosData) 
          ? gastosData.filter(g => g.id_caja === idCajaActiva)
          : [];
        const gastosSum = filtradosGastos.reduce((acc, g) => acc + parseFloat(g.monto), 0.0);

        setCorte({
          fondoInicial: fondo,
          ventas: { efectivo, tarjeta, transferencia },
          totalVentas: efectivo + tarjeta + transferencia,
          totalGastos: gastosSum,
          ticketsEmitidos: emitidos,
          ticketsCancelados: cancelados
        });
        setLoading(false);
      })
      .catch(err => {
        console.warn("Error cargando datos reales del corte:", err);
        setCorte(CORTE_VACIO);
        setLoading(false);
      });
  }, [idCajaActiva]);

  const totalEnCaja = corte.fondoInicial + corte.ventas.efectivo - corte.totalGastos;
  const diferencia = 0;

  return (
    <View style={styles.container}>
      <Header
        title="Corte de caja"
        subtitle={loading ? "Calculando..." : "Resumen del turno"}
        onBack={() => cambiarPantalla("inicio")}
        rightAction={{ icon: "menu", onPress: toggleSidebar }}
      />

      <ScrollView contentContainerStyle={styles.body} style={{ backgroundColor: Colors.background }}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.libre }]}>
            <Icon name="cash" size={22} color={Colors.success} />
            <Text style={styles.summaryValue}>
              ${corte.totalVentas.toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>Total ventas</Text>
          </View>
          <View
            style={[styles.summaryCard, { backgroundColor: Colors.ocupada }]}
          >
            <Icon name="receipt" size={22} color={Colors.danger} />
            <Text style={styles.summaryValue}>
              ${corte.totalGastos.toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>Total gastos</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ventas por metodo de pago</Text>
          <View style={styles.payRow}>
            <View style={styles.payLeft}>
              <Icon name="cash" size={18} color={Colors.secondary} />
              <Text style={styles.payLabel}> Efectivo</Text>
            </View>
            <Text style={styles.payValue}>
              ${corte.ventas.efectivo.toFixed(2)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <View style={styles.payLeft}>
              <Icon name="card" size={18} color={Colors.secondary} />
              <Text style={styles.payLabel}> Tarjeta</Text>
            </View>
            <Text style={styles.payValue}>
              ${corte.ventas.tarjeta.toFixed(2)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <View style={styles.payLeft}>
              <Icon name="phone" size={18} color={Colors.secondary} />
              <Text style={styles.payLabel}> Transferencia</Text>
            </View>
            <Text style={styles.payValue}>
              ${corte.ventas.transferencia.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.payRow}>
            <Text style={styles.payTotalLabel}>Total ventas</Text>
            <Text style={styles.payTotalValue}>
              ${corte.totalVentas.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen de caja</Text>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Fondo inicial</Text>
            <Text style={styles.payValue}>
              ${corte.fondoInicial.toFixed(2)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Ventas en efectivo</Text>
            <Text style={[styles.payValue, { color: Colors.success }]}>
              +${corte.ventas.efectivo.toFixed(2)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Gastos</Text>
            <Text style={[styles.payValue, { color: Colors.danger }]}>
              -${corte.totalGastos.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.payRow}>
            <Text style={styles.payTotalLabel}>Efectivo en caja</Text>
            <Text style={styles.payTotalValue}>
              ${totalEnCaja.toFixed(2)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Diferencia</Text>
            <Text
              style={[
                styles.payValue,
                { color: diferencia === 0 ? Colors.success : Colors.danger },
              ]}
            >
              ${diferencia.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tickets</Text>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Emitidos</Text>
            <Text style={styles.payValue}>{corte.ticketsEmitidos}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Cancelados</Text>
            <Text style={[styles.payValue, { color: Colors.danger }]}>
              {corte.ticketsCancelados}
            </Text>
          </View>
        </View>

        <PrimaryButton
          title="Cerrar turno"
          onPress={() => {
            if (idCajaActiva) {
              fetch(`${API_BASE_URL}/caja/${idCajaActiva}/cerrar`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
              })
              .then(() => cambiarPantalla("login"))
              .catch(() => cambiarPantalla("login"));
            } else {
              cambiarPantalla("login");
            }
          }}
          style={{ backgroundColor: Colors.danger, marginTop: 10 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  body: { padding: 20, paddingBottom: 40 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    elevation: 3,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
  },
  summaryLabel: { color: Colors.textLight, fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  payLeft: { flexDirection: "row", alignItems: "center" },
  payLabel: { color: Colors.textLight, fontSize: 15 },
  payValue: { fontSize: 15, fontWeight: "600", color: Colors.text },
  payTotalLabel: { fontSize: 17, fontWeight: "bold", color: Colors.text },
  payTotalValue: { fontSize: 17, fontWeight: "bold", color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
});
