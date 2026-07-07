import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import Icon from "../../shared/Icon";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.75;

const MENU_ICONS = {
  inicio: "home",
  pedidoListo: "bell",
  gastos: "receipt",
  suministros: "cube",
  corteCaja: "bar-chart",
  historialTickets: "list",
  perfil: "settings",
};

export default function SidebarCaja({
  isOpen,
  onClose,
  currentScreen,
  navigate,
  onLogout,
}) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  if (!isOpen) return null;

  const menuItems = [
    { id: "inicio", label: "Inicio" },
    { id: "pedidoListo", label: "Pedidos Listos" },
    { id: "gastos", label: "Registro de Gastos" },
    { id: "suministros", label: "Compra de Suministros" },
    { id: "corteCaja", label: "Corte de Caja" },
    { id: "historialTickets", label: "Historial de Tickets" },
    { id: "perfil", label: "Ajustes y Turno" },
  ];

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Icon name="coffee" size={22} color="#ffffff" />
              <Text style={styles.logoText}> CoffeeFlow</Text>
            </View>
            <Text style={styles.subtitle}>Modulo de Caja</Text>
          </View>

          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.activeItem]}
                  onPress={() => {
                    navigate(item.id);
                    onClose();
                  }}
                >
                  <View style={styles.menuRow}>
                    <Icon
                      name={MENU_ICONS[item.id]}
                      size={18}
                      color={
                        isActive ? "#ffffff" : "rgba(255,255,255,0.7)"
                      }
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        isActive && styles.activeLabel,
                      ]}
                    >
                      {" "}
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                onClose();
                onLogout();
              }}
            >
              <View style={styles.menuRow}>
                <Icon name="log-out" size={18} color="#ff7675" />
                <Text style={styles.logoutText}> Cerrar Sesion</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  drawer: {
    width: SIDEBAR_WIDTH,
    height: "100%",
    backgroundColor: "#2D1E16",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 16,
  },
  safeArea: { flex: 1 },
  header: {
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoText: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
  subtitle: { fontSize: 14, color: "#D7CCC8", marginTop: 4 },
  menuList: { flex: 1, paddingVertical: 20 },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  activeItem: { backgroundColor: "rgba(255, 255, 255, 0.15)" },
  menuRow: { flexDirection: "row", alignItems: "center" },
  menuLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  activeLabel: { color: "#ffffff", fontWeight: "700" },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 118, 117, 0.15)",
    borderRadius: 12,
  },
  logoutText: { color: "#ff7675", fontWeight: "bold", fontSize: 16 },
});
