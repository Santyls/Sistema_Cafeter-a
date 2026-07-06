import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
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
        <View style={styles.left}>
          {onBack ? (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Icon name="back" size={20} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 34 }} />
          )}
        </View>
        <View style={styles.center}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.right}>
          {rightAction ? (
            <TouchableOpacity style={styles.actionButton} onPress={rightAction.onPress}>
              <Icon name={rightAction.icon} size={18} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 50 }} />
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.primary, paddingTop: 18, paddingBottom: 18, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  left: { width: 50 },
  center: { flex: 1 },
  right: { width: 50, alignItems: "flex-end" },
  title: { color: Colors.white, fontSize: 24, fontWeight: "bold" },
  subtitle: { color: "#DFC7B4", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  backButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center" },
  actionButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center" },
});
