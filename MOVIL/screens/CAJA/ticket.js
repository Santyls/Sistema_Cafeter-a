import React from "react";
import { SafeAreaView, View, Text, ScrollView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

import Colors from "./styles/colors";
import Icon from "../shared/Icon";
import PrimaryButton from "./components/PrimaryButton";

import { API_BASE_URL } from '../../config/api';
export default function Ticket({
  mesa,
  pedido,
  subtotal,
  iva,
  total,
  metodoPago,
  cambiarPantalla,
  limpiarPedido,
}) {
  const metodoTexto =
    metodoPago === "efectivo"
      ? "Efectivo"
      : metodoPago === "tarjeta"
      ? "Tarjeta"
      : "Transferencia";

  const folio = `T-${Date.now().toString().slice(-6)}`;
  const fecha = new Date().toLocaleDateString("es-MX");
  const hora = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Icon name="coffee" size={28} color={Colors.primary} />
            <Text style={styles.storeName}>CoffeeFlow</Text>
            <Text style={styles.ticketSubtitle}>Ticket de venta</Text>
          </View>

          <View style={styles.dividerDashed} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Folio</Text>
              <Text style={styles.infoValue}>{folio}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mesa</Text>
              <Text style={styles.infoValue}>{mesa?.numero}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>{fecha}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hora</Text>
              <Text style={styles.infoValue}>{hora}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cajero</Text>
              <Text style={styles.infoValue}>Carlos Lopez</Text>
            </View>
          </View>

          <View style={styles.dividerDashed} />

          <View style={styles.itemsSection}>
            <View style={styles.itemHeaderRow}>
              <Text style={styles.itemHeaderText}>Producto</Text>
              <Text style={styles.itemHeaderText}>Importe</Text>
            </View>
            {pedido.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.cantidad}x {item.nombre}
                </Text>
                <Text style={styles.itemTotal}>
                  ${(item.cantidad * item.precio).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.dividerDashed} />

          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (16%)</Text>
              <Text style={styles.totalValue}>${iva.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Metodo de pago</Text>
              <Text style={styles.totalValue}>{metodoTexto}</Text>
            </View>
          </View>

          <View style={styles.dividerDashed} />

          <Text style={styles.footerText}>Gracias por su visita</Text>
        </View>

        <View style={{ gap: 12, marginTop: 20 }}>
          <PrimaryButton
            title="Descargar Ticket (PDF)"
            onPress={() => {
              const { Alert } = require('react-native');
              const Print = require('expo-print');
              const Sharing = require('expo-sharing');
              
              const htmlContent = `
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #0A1931; }
                      .container { max-width: 400px; margin: 0 auto; border: 1px solid #E5E5EA; padding: 20px; border-radius: 12px; }
                      .header { text-align: center; margin-bottom: 20px; }
                      .header h1 { margin: 0; font-size: 24px; color: #0A1931; }
                      .header p { margin: 5px 0 0 0; font-size: 14px; color: #8E8E93; }
                      .divider { border-top: 1px dashed #E5E5EA; margin: 15px 0; }
                      .info-row { display: flex; justify-content: space-between; font-size: 13px; margin: 5px 0; }
                      .info-label { color: #8E8E93; }
                      .info-value { font-weight: bold; }
                      .item-row { display: flex; justify-content: space-between; font-size: 14px; margin: 8px 0; }
                      .item-total { font-weight: bold; }
                      .totals { margin-top: 15px; }
                      .total-row { display: flex; justify-content: space-between; font-size: 14px; margin: 5px 0; }
                      .grand-total { font-size: 18px; font-weight: bold; color: #0A1931; border-top: 1px solid #0A1931; padding-top: 10px; margin-top: 10px; }
                      .footer { text-align: center; font-style: italic; font-size: 12px; color: #8E8E93; margin-top: 30px; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>CoffeeFlow</h1>
                        <p>Ticket de Venta</p>
                      </div>
                      <div class="divider"></div>
                      <div class="info-row"><span class="info-label">Folio:</span><span class="info-value">${folio}</span></div>
                      <div class="info-row"><span class="info-label">Mesa:</span><span class="info-value">${mesa ? (mesa.numero || mesa.id) : 'N/A'}</span></div>
                      <div class="info-row"><span class="info-label">Fecha:</span><span class="info-value">${fecha}</span></div>
                      <div class="info-row"><span class="info-label">Hora:</span><span class="info-value">${hora}</span></div>
                      <div class="divider"></div>
                      <div>
                        ${pedido.map(item => `
                          <div class="item-row">
                            <span>${item.cantidad}x ${item.nombre}</span>
                            <span class="item-total">$${(item.cantidad * item.precio).toFixed(2)}</span>
                          </div>
                        `).join('')}
                      </div>
                      <div class="divider"></div>
                      <div class="totals">
                        <div class="total-row"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
                        <div class="total-row"><span>IVA (16%):</span><span>$${iva.toFixed(2)}</span></div>
                        <div class="total-row grand-total"><span>TOTAL:</span><span>$${total.toFixed(2)}</span></div>
                        <div class="total-row"><span>Método de Pago:</span><span>${metodoTexto}</span></div>
                      </div>
                      <div class="footer">
                        ¡Gracias por su visita!
                      </div>
                    </div>
                  </body>
                </html>
              `;
              
              Print.printToFileAsync({ html: htmlContent })
                .then(file => {
                  Sharing.shareAsync(file.uri);
                })
                .catch(err => {
                  console.error(err);
                  Alert.alert("Error", "No se pudo generar o descargar el PDF del ticket.");
                });
            }}
            style={{ backgroundColor: "#4E8D70" }}
          />

          <PrimaryButton
            title="Enviar Ticket por Correo"
            onPress={() => {
              const { Alert, Platform } = require('react-native');
              
              const sendEmailTicket = (emailAddress) => {
                if (!emailAddress) {
                  Alert.alert("Error", "Debes ingresar un correo válido.");
                  return;
                }
                fetch(`${API_BASE_URL}/caja/enviar-ticket`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: emailAddress,
                    folio: folio,
                    mesa: mesa ? (mesa.numero || mesa) : 'N/A',
                    total: total,
                    pedido: pedido,
                    metodoPago: metodoPago
                  })
                })
                .then(res => res.json())
                .then(data => {
                  if (data.error) {
                    Alert.alert("Error", data.error);
                  } else {
                    Alert.alert("Éxito", "Ticket enviado por correo electrónico con éxito.");
                  }
                })
                .catch(err => {
                  Alert.alert("Error de Conexión", "No se pudo conectar al servidor para enviar el ticket.");
                });
              };

              if (Platform.OS === 'ios') {
                Alert.prompt(
                  "Enviar por Correo",
                  "Ingresa el correo electrónico del cliente:",
                  [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Enviar", onPress: (val) => sendEmailTicket(val) }
                  ],
                  "plain-text",
                  "albertolunarufino@gmail.com"
                );
              } else {
                Alert.alert(
                  "Enviar por Correo",
                  "Se enviará el comprobante digital al correo: albertolunarufino@gmail.com",
                  [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Enviar", onPress: () => sendEmailTicket("albertolunarufino@gmail.com") }
                  ]
                );
              }
            }}
            style={{ backgroundColor: "#0A1931" }}
          />

          <PrimaryButton
            title="Finalizar y Volver a Mesas"
            onPress={() => {
              if (limpiarPedido) limpiarPedido();
              cambiarPantalla("inicio");
            }}
            style={{ backgroundColor: Colors.primary }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { padding: 20, paddingBottom: 40 },
  ticketCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  ticketHeader: { alignItems: "center", marginBottom: 5 },
  storeName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 8,
  },
  ticketSubtitle: { color: Colors.textLight, fontSize: 14, marginTop: 4 },
  dividerDashed: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.border,
    marginVertical: 16,
  },
  infoSection: {},
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: { color: Colors.textLight, fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "600", color: Colors.text },
  itemsSection: {},
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemHeaderText: {
    color: Colors.textLight,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemName: { color: Colors.text, fontSize: 15 },
  itemTotal: { fontSize: 15, fontWeight: "600", color: Colors.text },
  totalsSection: {},
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: { color: Colors.textLight, fontSize: 15 },
  totalValue: { fontSize: 15, fontWeight: "600", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  grandTotalLabel: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  grandTotalValue: { fontSize: 20, fontWeight: "bold", color: Colors.primary },
  footerText: {
    textAlign: "center",
    color: Colors.textLight,
    fontSize: 14,
    fontStyle: "italic",
  },
});
