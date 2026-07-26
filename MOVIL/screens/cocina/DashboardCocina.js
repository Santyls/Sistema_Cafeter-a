import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Animated,
} from 'react-native';
import Icon from '../shared/Icon';
import getTheme from '../shared/theme';

export default function DashboardCocina({
  navigate,
  toggleSidebar,
  orders,
  inventory,
  notifications,
  currentUser,
  darkMode,
}) {
  const theme = getTheme(darkMode);
  
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  const pendingCount = orders.filter((o) => o.status === 'pendiente' && o.fecha === todayStr).length;
  const progressCount = orders.filter((o) => o.status === 'en_preparacion' && o.fecha === todayStr).length;
  const readyCount = orders.filter((o) => o.status === 'listo' && o.fecha === todayStr).length;
  const lowStockCount = inventory.filter((i) => i.actual <= i.minimum).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const wiggleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const wiggle = () => {
      if (!isMounted || unreadNotifications === 0) return;
      Animated.sequence([
        Animated.timing(wiggleAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.timing(wiggleAnim, { toValue: -1, duration: 100, useNativeDriver: false }),
        Animated.timing(wiggleAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.timing(wiggleAnim, { toValue: -1, duration: 100, useNativeDriver: false }),
        Animated.timing(wiggleAnim, { toValue: 0, duration: 100, useNativeDriver: false }),
      ]).start(() => {
        timeoutId = setTimeout(() => {
          wiggle();
        }, 3000);
      });
    };

    if (unreadNotifications > 0) {
      wiggle();
    } else {
      wiggleAnim.setValue(0);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [unreadNotifications]);

  const rotation = wiggleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-18deg', '18deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.appContainer, { backgroundColor: theme.bg }]}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleGroup}>
              <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
                <Icon name="menu" size={22} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>CoffeeFlow &bull; Panel de Cocina</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} onPress={() => navigate('notificaciones')}>
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Icon name="bell" size={20} color="#ffffff" />
              </Animated.View>
              {unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Bienvenido, {currentUser || 'Cocinero'}</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg, borderWidth: 2, borderColor: '#0A1931' }]} onPress={() => navigate('pedidos', { filter: 'pendiente' })}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FFF9DB' }]}>
                <Icon name="clipboard" size={20} color="#F0AD4E" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Pedidos{"\n"}Pendientes</Text>
              <Text style={[styles.cardNumber, { color: '#F0AD4E' }]}>{pendingCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg, borderWidth: 2, borderColor: '#0A1931' }]} onPress={() => navigate('preparacion')}>
              <View style={[styles.iconWrapper, { backgroundColor: '#E3F2FD' }]}>
                <Icon name="flame" size={20} color="#007AFF" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>En{"\n"}Preparacion</Text>
              <Text style={[styles.cardNumber, { color: '#007AFF' }]}>{progressCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg, borderWidth: 2, borderColor: '#0A1931' }]} onPress={() => navigate('listos')}>
              <View style={[styles.iconWrapper, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="check-circle" size={20} color="#34C759" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Listos{"\n"}para Servir</Text>
              <Text style={[styles.cardNumber, { color: '#34C759' }]}>{readyCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg, borderWidth: 2, borderColor: '#0A1931' }]} onPress={() => navigate('inventario')}>
              <View style={[styles.iconWrapper, { backgroundColor: '#EFEBE9' }]}>
                <Icon name="cube" size={20} color="#9A7B1C" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Inventario{"\n"}Insumos</Text>
              <Text style={[styles.cardTextButton, { color: '#9A7B1C' }]}>Ver</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg, borderWidth: 2, borderColor: '#0A1931' }]} onPress={() => navigate('stock_bajo')}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FFEBEE' }]}>
                <Icon name="warning" size={20} color="#FF3B30" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Alertas{"\n"}de Stock</Text>
              <Text style={[styles.cardNumber, { color: '#FF3B30' }]}>{lowStockCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg, borderWidth: 2, borderColor: '#0A1931' }]} onPress={() => navigate('historial')}>
              <View style={[styles.iconWrapper, { backgroundColor: '#F3E5F5' }]}>
                <Icon name="receipt" size={20} color="#9b59b6" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Historial{"\n"}de Pedidos</Text>
              <Text style={[styles.cardTextButton, { color: '#9b59b6' }]}>Ver</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitySection}>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>Actividad Reciente</Text>
            <View style={[styles.activityList, { backgroundColor: theme.cardBg }]}>
              {orders.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Icon name="check-circle" size={32} color={theme.textMuted} style={{ marginBottom: 8 }} />
                  <Text style={{ color: theme.textMuted, fontSize: 13, textAlign: 'center' }}>
                    No hay actividad reciente. ¡El día iniciará en blanco!
                  </Text>
                </View>
              ) : (
                orders.slice(-3).reverse().map((o, idx) => (
                  <View key={o.id || idx} style={[styles.activityItem, { borderBottomColor: theme.border }]}>
                    <Icon
                      name={o.status === 'listo' ? "check-circle" : (o.status === 'en_preparacion' ? "play-circle" : "cube")}
                      size={20}
                      color={o.status === 'listo' ? "#34C759" : (o.status === 'en_preparacion' ? "#007AFF" : "#F0AD4E")}
                      style={{ marginRight: 16 }}
                    />
                    <View style={styles.activityDetails}>
                      <Text style={[styles.activityText, { color: theme.textMain }]}>
                        Pedido #{o.id} - {o.table || 'Mesa'} {o.status === 'en_preparacion' ? 'en preparación' : (o.status === 'listo' ? 'listo' : 'recibido')}
                      </Text>
                      <Text style={[styles.activityTime, { color: theme.textMuted }]}>{o.time || 'Hace un momento'}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A1931',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#F9F8F6',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : (RNStatusBar.currentHeight || 0) + 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#0A1931',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.8,
    color: '#D7CCC8',
  },
  bellBtn: { padding: 4, position: 'relative' },
  badge: { position: 'absolute', right: -4, top: -2, backgroundColor: '#FF3B30', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  scrollContent: { padding: 20, flexGrow: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#ffffff', width: '48%', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, alignItems: 'flex-start' },
  iconWrapper: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', lineHeight: 18 },
  cardNumber: { fontSize: 28, fontWeight: 'bold', marginTop: 8 },
  cardTextButton: { fontSize: 18, fontWeight: 'bold', marginTop: 14 },
  activitySection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0A1931', marginBottom: 16 },
  activityList: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f2' },
  activityDetails: { flex: 1 },
  activityText: { fontSize: 14, fontWeight: '600', color: '#0A1931' },
  activityTime: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
});
