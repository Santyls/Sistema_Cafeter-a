import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";

import Colors from "./styles/colors";
import Icon from "../shared/Icon";

export default function Perfil({ cambiarPantalla, toggleSidebar, onLogout }) {
  const [subScreen, setSubScreen] = useState("main");
  const [clockedIn, setClockedIn] = useState(true);
  const [shiftTime] = useState("04:12 hrs");
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sounds, setSounds] = useState(true);
  const [editName, setEditName] = useState("Carlos Lopez");
  const [editEmail, setEditEmail] = useState("carlos.caja@coffeeflow.com");
  const [editPhone, setEditPhone] = useState("+52 442 000 0000");

  const [salesTotal] = useState(2340.0);
  const [completedOrdersCount] = useState(14);

  const notificationHistory = [
    { id: 1, type: "system", message: "Nuevo pedido listo para cobro - Mesa 3", time: "Hace 2 min", read: false },
    { id: 2, type: "system", message: "Corte parcial realizado exitosamente", time: "Hace 30 min", read: true },
    { id: 3, type: "system", message: "Nuevo gasto registrado: $150.00", time: "Hace 1 hr", read: true },
  ];

  const renderHeader = (title, subtitle, showBack = false) => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View style={styles.headerTitleGroup}>
          {showBack ? (
            <TouchableOpacity style={styles.backButton} onPress={() => setSubScreen("main")}>
              <Icon name="back" size={20} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
              <Icon name="menu" size={22} color="#ffffff" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </View>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  );

  const handleLogout = () => {
    if (onLogout) onLogout();
    else cambiarPantalla("login");
  };

  if (subScreen === "statistics") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.appContainer}>
          {renderHeader("Mis Estadisticas", "Rendimiento en el turno", true)}
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>Resumen de Ventas Acumuladas</Text>
              <Text style={styles.bigNumber}>${salesTotal.toFixed(2)} MXN</Text>
              <Text style={styles.mutedCenter}>
                Total correspondiente a {completedOrdersCount} tickets procesados hoy.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Ventas por Hora</Text>
            <View style={styles.card}>
              <View style={styles.chartContainer}>
                {[
                  { hour: "10 AM", val: 320, height: 40 },
                  { hour: "11 AM", val: 540, height: 70 },
                  { hour: "12 PM", val: 690, height: 90 },
                  { hour: "01 PM", val: 480, height: 60 },
                  { hour: "02 PM", val: 310, height: 38 },
                ].map((bar) => (
                  <View key={bar.hour} style={styles.chartCol}>
                    <Text style={styles.chartLabel}>${bar.val}</Text>
                    <View style={[styles.chartBar, { height: bar.height }]} />
                    <Text style={styles.chartHour}>{bar.hour}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Metricas de Eficiencia</Text>
            <View style={styles.card}>
              <View style={styles.receiptRow}>
                <Text style={styles.textMuted}>Ticket Promedio</Text>
                <Text style={styles.textBold}>${(salesTotal / (completedOrdersCount || 1)).toFixed(2)} MXN</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.textMuted}>Tiempo Promedio Cobro</Text>
                <Text style={styles.textBold}>3 minutos</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (subScreen === "alerts") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.appContainer}>
          {renderHeader("Centro de Alertas", "Historial de avisos", true)}
          <View style={styles.contentContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notificationHistory.map((item) => (
                <View key={item.id} style={[styles.card, !item.read && { borderLeftWidth: 4, borderLeftColor: "#5BC0DE" }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: Colors.secondary, fontWeight: "bold" }}>Sistema</Text>
                    <Text style={{ fontSize: 11, color: Colors.textLight }}>{item.time}</Text>
                  </View>
                  <Text style={{ color: Colors.text, fontSize: 13 }}>{item.message}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.btn} onPress={() => Alert.alert("Listo", "Todas las alertas marcadas como leidas.")}>
              <Text style={styles.btnText}>Marcar todas como leidas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (subScreen === "edit_profile") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.appContainer}>
          {renderHeader("Editar Perfil", "Configuracion de datos", true)}
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: "center", marginVertical: 20 }}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>CL</Text>
                <TouchableOpacity style={styles.avatarCameraBtn}>
                  <Icon name="camera" size={14} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Datos Personales</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Rol asignado</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value="Cajero" editable={false} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo electronico</Text>
              <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Numero de telefono</Text>
              <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
            </View>

            <TouchableOpacity style={styles.btn} onPress={() => { Alert.alert("Guardado", "Datos actualizados."); setSubScreen("main"); }}>
              <Text style={styles.btnText}>Guardar cambios</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnOutlineDanger} onPress={handleLogout}>
              <Text style={{ color: Colors.danger, fontWeight: "600", textAlign: "center" }}>Cerrar Sesion</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        {renderHeader("Configuracion", "Informacion del cajero y turno")}

        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { alignItems: "center" }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>CL</Text>
            </View>
            <Text style={styles.waiterName}>Carlos Lopez</Text>
            <Text style={styles.waiterRole}>Cajero</Text>
            <View style={[styles.shiftBadge, { backgroundColor: clockedIn ? "#4E8D7022" : "#D9534F22" }]}>
              <Text style={{ color: clockedIn ? "#4E8D70" : Colors.danger, fontWeight: "600", fontSize: 13 }}>
                {clockedIn ? "● Turno Activo" : "● Turno Finalizado"}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Panel de Turno</Text>
          <View style={styles.card}>
            <View style={styles.receiptRow}>
              <Text style={styles.textMuted}>Duracion de Turno</Text>
              <Text style={styles.textBold}>{shiftTime}</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={[styles.smallBtn, { flex: 1 }]} onPress={() => setSubScreen("statistics")}>
                <Text style={styles.smallBtnText}>Ver Reportes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, { flex: 1 }]} onPress={() => setSubScreen("alerts")}>
                <Text style={styles.smallBtnText}>Alertas</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: clockedIn ? Colors.danger : "#4E8D70", marginTop: 12 }]}
              onPress={() => {
                setClockedIn(!clockedIn);
                Alert.alert(
                  clockedIn ? "Turno Finalizado" : "Turno Iniciado",
                  clockedIn ? "Has cerrado tu jornada." : "Jornada iniciada con exito."
                );
              }}
            >
              <Text style={styles.btnText}>
                {clockedIn ? "Finalizar Jornada (Clock-Out)" : "Iniciar Jornada (Clock-In)"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={[styles.card, { paddingVertical: 4 }]}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Notificaciones de Caja</Text>
              <Switch value={notificationsOn} onValueChange={setNotificationsOn} trackColor={{ false: "#ccc", true: "#4E8D70" }} />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Modo Oscuro</Text>
              <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: "#ccc", true: "#4E8D70" }} />
            </View>
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.settingLabel}>Sonidos del Sistema</Text>
              <Switch value={sounds} onValueChange={setSounds} trackColor={{ false: "#ccc", true: "#4E8D70" }} />
            </View>
          </View>

          <TouchableOpacity style={styles.btnOutline} onPress={() => setSubScreen("edit_profile")}>
            <Text style={{ color: Colors.primary, fontWeight: "600", textAlign: "center" }}>Editar Datos Personales</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  appContainer: { flex: 1, backgroundColor: Colors.background },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitleGroup: { flexDirection: "row", alignItems: "center" },
  backButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255, 255, 255, 0.15)", justifyContent: "center", alignItems: "center", marginRight: 12 },
  menuButton: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#ffffff", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, marginTop: 4, opacity: 0.8, color: "#D7CCC8" },
  contentContainer: { flex: 1, padding: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeaderTitle: { fontSize: 16, fontWeight: "bold", color: Colors.text, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 12, marginBottom: 8, textAlign: "center" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.secondary, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { fontSize: 28, color: "#ffffff", fontWeight: "bold" },
  avatarCameraBtn: { position: "absolute", bottom: -2, right: -2, backgroundColor: "#ffffff", width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#eee" },
  waiterName: { fontSize: 20, fontWeight: "bold", color: Colors.text, marginTop: 4 },
  waiterRole: { fontSize: 14, color: Colors.textLight, marginTop: 2 },
  shiftBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: Colors.secondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  textMuted: { color: Colors.textLight },
  textBold: { color: Colors.text, fontWeight: "bold" },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingLabel: { fontSize: 15, color: Colors.text, fontWeight: "500" },
  smallBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, justifyContent: "center", alignItems: "center" },
  smallBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 13, textAlign: "center" },
  btn: { width: "100%", padding: 16, borderRadius: 16, justifyContent: "center", alignItems: "center", backgroundColor: Colors.primary, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2, marginTop: 10 },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  btnOutline: { width: "100%", padding: 16, borderRadius: 16, justifyContent: "center", alignItems: "center", backgroundColor: Colors.white, borderColor: Colors.border, borderWidth: 1, marginTop: 10, marginBottom: 40 },
  btnOutlineDanger: { width: "100%", padding: 16, borderRadius: 16, justifyContent: "center", alignItems: "center", backgroundColor: Colors.white, borderColor: Colors.danger, borderWidth: 1, marginTop: 12, marginBottom: 40 },
  formGroup: { marginBottom: 16, width: "100%" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginLeft: 4, color: Colors.textLight },
  input: { width: "100%", padding: 16, borderRadius: 16, borderWidth: 1, fontSize: 15, backgroundColor: Colors.white, color: Colors.text, borderColor: Colors.border },
  inputDisabled: { backgroundColor: Colors.border, color: Colors.textLight },
  bigNumber: { color: Colors.primary, fontSize: 32, fontWeight: "bold", textAlign: "center", marginVertical: 12 },
  mutedCenter: { color: Colors.textLight, fontSize: 12, textAlign: "center" },
  chartContainer: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 120, paddingTop: 10 },
  chartCol: { alignItems: "center" },
  chartBar: { width: 24, backgroundColor: Colors.primary, borderRadius: 6 },
  chartLabel: { fontSize: 9, color: Colors.textLight, marginBottom: 4 },
  chartHour: { fontSize: 10, color: Colors.text, marginTop: 6 },
});
