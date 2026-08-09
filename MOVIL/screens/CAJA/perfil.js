import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";

import Colors from "./styles/colors";
import Icon from "../shared/Icon";
import useTurno from "../shared/useTurno";
import AvisoModal, { useAviso } from "../shared/AvisoModal";
import { API_BASE_URL } from "../../config/api";

// Tipos de aviso que llegan a caja, con su etiqueta visible.
const ETIQUETA_ALERTA = {
  new: "Nuevo pedido",
  ready: "Listo para cobro",
  low_stock: "Inventario",
};

export default function Perfil({
  cambiarPantalla,
  toggleSidebar,
  onLogout,
  usuarioLogueado,
  inicioTurno,
  notifications = [],
  onMarkAllNotificationsRead,
  onPerfilActualizado,
  token,
}) {
  const { aviso, mostrarAviso, confirmar, cerrarAviso } = useAviso();
  const [subScreen, setSubScreen] = useState("main");
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sounds, setSounds] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Duracion real del turno, contada desde el inicio de sesion.
  const shiftTime = useTurno(inicioTurno);

  // Datos reales del cajero autenticado.
  const nombreCompleto = usuarioLogueado
    ? `${usuarioLogueado.nombre} ${usuarioLogueado.apellido_paterno || ""}`.trim()
    : "Cajero";

  const [editName, setEditName] = useState(usuarioLogueado?.nombre || "");
  const [editLastName, setEditLastName] = useState(usuarioLogueado?.apellido_paterno || "");
  const [editEmail, setEditEmail] = useState(usuarioLogueado?.correo || "");
  const [editPhone, setEditPhone] = useState(usuarioLogueado?.telefono || "");

  const iniciales = React.useMemo(() => {
    const partes = nombreCompleto.split(" ").filter(Boolean);
    if (partes.length === 0) return "CA";
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }, [nombreCompleto]);

  // Cobros reales del dia, tomados de los tickets pagados que guarda la API.
  const [tickets, setTickets] = useState([]);
  const [cargandoTickets, setCargandoTickets] = useState(true);

  React.useEffect(() => {
    if (!token) return;
    setCargandoTickets(true);
    fetch(`${API_BASE_URL}/tickets?with_pagos=true`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("tickets");
        return res.json();
      })
      .then((data) => {
        setTickets(data || []);
        setCargandoTickets(false);
      })
      .catch(() => setCargandoTickets(false));
  }, [token]);

  const { salesTotal, completedOrdersCount, ventasPorMetodo } = React.useMemo(() => {
    const hoy = new Date().toDateString();
    const cobradosHoy = tickets.filter((t) => {
      if (t.estado !== "pagado") return false;
      let fecha = t.fecha || "";
      if (fecha && !fecha.endsWith("Z") && !fecha.includes("+")) fecha += "Z";
      return new Date(fecha).toDateString() === hoy;
    });

    const total = cobradosHoy.reduce((acc, t) => acc + (Number(t.total) || 0), 0);

    const NOMBRE_METODO = {
      efectivo: "Efectivo",
      tarjeta: "Tarjeta",
      transferencia: "Transferencia",
    };
    const porMetodo = cobradosHoy.reduce((acc, t) => {
      const tipo = t.pagos && t.pagos.length > 0 ? t.pagos[0].tipo_pago : null;
      const metodo = NOMBRE_METODO[tipo] || "Sin registrar";
      acc[metodo] = (acc[metodo] || 0) + (Number(t.total) || 0);
      return acc;
    }, {});

    return {
      salesTotal: total,
      completedOrdersCount: cobradosHoy.length,
      ventasPorMetodo: Object.entries(porMetodo),
    };
  }, [tickets]);

  const notificationHistory = notifications;
  const avisosSinLeer = notifications.filter((n) => !n.read).length;

  const guardarPerfil = () => {
    if (!editName.trim()) {
      mostrarAviso("Datos incompletos", "El nombre no puede quedar vacio.");
      return;
    }

    setGuardando(true);
    fetch(`${API_BASE_URL}/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: editName.trim(),
        apellido_paterno: editLastName.trim(),
        telefono: editPhone.trim(),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudieron guardar los cambios.");
        return res.json();
      })
      .then((usuarioActualizado) => {
        setGuardando(false);
        if (onPerfilActualizado) onPerfilActualizado(usuarioActualizado);
        mostrarAviso("Perfil actualizado", "Tus datos se guardaron correctamente.");
        setSubScreen("main");
      })
      .catch((error) => {
        setGuardando(false);
        mostrarAviso("Error", error.message || "No se pudo conectar con el servidor.");
      });
  };

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
              <Text style={styles.cardHeaderTitle}>Ventas Cobradas Hoy</Text>
              <Text style={styles.bigNumber}>
                {cargandoTickets ? "..." : `$${salesTotal.toFixed(2)} MXN`}
              </Text>
              <Text style={styles.mutedCenter}>
                {completedOrdersCount === 1
                  ? "1 ticket procesado"
                  : `${completedOrdersCount} tickets procesados`}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Ventas por Metodo de Pago</Text>
            <View style={styles.card}>
              {ventasPorMetodo.length === 0 ? (
                <Text style={styles.mutedCenter}>
                  {cargandoTickets ? "Cargando cobros..." : "Aun no hay cobros registrados hoy."}
                </Text>
              ) : (
                ventasPorMetodo.map(([metodo, monto]) => (
                  <View key={metodo} style={styles.receiptRow}>
                    <Text style={styles.textMuted}>{metodo}</Text>
                    <Text style={styles.textBold}>${monto.toFixed(2)} MXN</Text>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>Metricas de Eficiencia</Text>
            <View style={styles.card}>
              <View style={styles.receiptRow}>
                <Text style={styles.textMuted}>Ticket Promedio</Text>
                <Text style={styles.textBold}>${(salesTotal / (completedOrdersCount || 1)).toFixed(2)} MXN</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.textMuted}>Duracion del turno</Text>
                <Text style={styles.textBold}>{shiftTime}</Text>
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
              {notificationHistory.length === 0 ? (
                <View style={{ alignItems: "center", marginTop: 60 }}>
                  <Icon name="bell-outline" size={48} color={Colors.textLight} />
                  <Text style={{ color: Colors.textLight, fontSize: 15, marginTop: 16 }}>
                    Sin avisos por ahora.
                  </Text>
                </View>
              ) : (
                notificationHistory.map((item) => (
                  <View key={item.id} style={[styles.card, !item.read && { borderLeftWidth: 4, borderLeftColor: "#5BC0DE" }]}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, color: Colors.secondary, fontWeight: "bold" }}>
                        {ETIQUETA_ALERTA[item.type] || "Sistema"}
                      </Text>
                      <Text style={{ fontSize: 11, color: Colors.textLight }}>{item.time}</Text>
                    </View>
                    <Text style={{ color: Colors.text, fontSize: 13 }}>{item.message}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            {notificationHistory.length > 0 && (
              <TouchableOpacity style={styles.btn} onPress={onMarkAllNotificationsRead}>
                <Text style={styles.btnText}>Marcar todas como leidas</Text>
              </TouchableOpacity>
            )}
          </View>
          <AvisoModal aviso={aviso} onClose={cerrarAviso} />
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
                <Text style={styles.avatarText}>{iniciales}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Datos Personales</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Rol asignado</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value="Cajero" editable={false} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Apellido paterno</Text>
              <TextInput style={styles.input} value={editLastName} onChangeText={setEditLastName} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo electronico</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={editEmail} editable={false} keyboardType="email-address" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Numero de telefono</Text>
              <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
            </View>

            <TouchableOpacity style={[styles.btn, guardando && { opacity: 0.6 }]} onPress={guardarPerfil} disabled={guardando}>
              <Text style={styles.btnText}>{guardando ? "Guardando..." : "Guardar cambios"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnOutlineDanger} onPress={handleLogout}>
              <Text style={{ color: Colors.danger, fontWeight: "600", textAlign: "center" }}>Cerrar Sesion</Text>
            </TouchableOpacity>
          </ScrollView>
          <AvisoModal aviso={aviso} onClose={cerrarAviso} />
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
              <Text style={styles.avatarText}>{iniciales}</Text>
            </View>
            <Text style={styles.waiterName}>{nombreCompleto}</Text>
            <Text style={styles.waiterRole}>Cajero</Text>
            <View style={[styles.shiftBadge, { backgroundColor: "#4E8D7022" }]}>
              <Text style={{ color: "#4E8D70", fontWeight: "600", fontSize: 13 }}>● Turno Activo</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Panel de Turno</Text>
          <View style={styles.card}>
            <View style={styles.receiptRow}>
              <Text style={styles.textMuted}>Duracion de Turno</Text>
              <Text style={styles.textBold}>{shiftTime}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.textMuted}>Tickets cobrados hoy</Text>
              <Text style={styles.textBold}>{completedOrdersCount}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.textMuted}>Avisos sin leer</Text>
              <Text style={styles.textBold}>{avisosSinLeer}</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={[styles.smallBtn, { flex: 1 }]} onPress={() => setSubScreen("statistics")}>
                <Text style={styles.smallBtnText}>Ver Reportes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, { flex: 1 }]} onPress={() => setSubScreen("alerts")}>
                <Text style={styles.smallBtnText}>Alertas</Text>
              </TouchableOpacity>
            </View>

            {/* El turno de caja dura lo que dura la sesion: cerrarla lo finaliza. */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: Colors.danger, marginTop: 12 }]}
              onPress={() =>
                confirmar(
                  "Finalizar jornada",
                  `Llevas ${shiftTime} en turno. Al finalizar se cerrara tu sesion.`,
                  handleLogout,
                  "Finalizar"
                )
              }
            >
              <Text style={styles.btnText}>Finalizar Jornada</Text>
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
        <AvisoModal aviso={aviso} onClose={cerrarAviso} />
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
});
