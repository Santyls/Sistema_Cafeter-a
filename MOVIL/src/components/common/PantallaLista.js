import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeContext';
import EmptyState from './EmptyState';

/**
 * Pantalla cuyo cuerpo es una lista larga.
 *
 * Existe porque ScreenContainer mete todo en un ScrollView, que renderiza cada
 * elemento aunque no se vea: con el menu de 132 productos eso creaba mas de mil vistas
 * y la app se congelaba al escribir en el buscador, porque cada tecla volvia a dibujar
 * la lista completa. FlatList solo dibuja lo que cabe en pantalla.
 *
 * Un FlatList NUNCA debe ir dentro de un ScrollView (pierde la virtualizacion y React
 * Native lo advierte), por eso esta pantalla trae su propio marco en vez de reusar
 * ScreenContainer.
 */
export default function PantallaLista({
  title,
  subtitle,
  headerRight,
  datos = [],
  renderItem,
  keyExtractor,
  encabezado,
  pie,
  cargando,
  error,
  onReintentar,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  onRefresh,
  // Los modales de la pantalla van aqui: fuera de la lista, para que no se
  // desmonten al reciclarse las filas.
  children,
}) {
  const { colors, spacing, typography } = useAppTheme();

  const vacio = () => {
    if (cargando && datos.length === 0) {
      return <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.lg }} />;
    }
    if (error) {
      return (
        <Pressable onPress={onReintentar}>
          <Text style={[typography.small, { color: colors.danger, marginTop: spacing.md }]}>
            {error}
          </Text>
        </Pressable>
      );
    }
    return <EmptyState icon={emptyIcon} title={emptyTitle} subtitle={emptySubtitle} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {title ? (
        <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.sm }]}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h1, { color: colors.text }]}>{title}</Text>
            {subtitle ? (
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {headerRight}
        </View>
      ) : null}

      <FlatList
        data={datos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={encabezado}
        ListEmptyComponent={vacio}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
        refreshing={!!cargando}
        onRefresh={onRefresh}
        // Con estos limites solo se construyen las tarjetas visibles y un poco de
        // margen, en vez de las 132 del menu completo.
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />

      {pie ? (
        <View
          style={[
            styles.pie,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              padding: spacing.md,
            },
          ]}
        >
          {pie}
        </View>
      ) : null}

      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  pie: { borderTopWidth: StyleSheet.hairlineWidth },
});
