import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import Colors from "../styles/colors";
import Icon from "../../shared/Icon";

export default function Header({
  title,
  subtitle,
  onBack,
  rightAction,
}) {
  return (
    <>
      <StatusBar
        backgroundColor={Colors.primary}
        barStyle="light-content"
      />
      <View style={styles.container}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleGroup}>
            {onBack ? (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Icon name="back" size={20} color="#ffffff" />
              </TouchableOpacity>
            ) : rightAction ? (
              <TouchableOpacity style={styles.menuButton} onPress={rightAction.onPress}>
                <Icon name={rightAction.icon} size={22} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 34 }} />
            )}
            <Text style={styles.title}>{title}</Text>
          </View>
          {rightAction && onBack && (
            <TouchableOpacity style={styles.actionButton} onPress={rightAction.onPress}>
              <Icon name={rightAction.icon} size={18} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#D7CCC8",
    fontSize: 13,
    marginTop: 4,
    opacity: 0.8,
  },
});
