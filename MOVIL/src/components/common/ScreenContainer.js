import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeContext';

/**
 * Marco comun de todas las pantallas: area segura, encabezado con titulo y subtitulo,
 * y el contenido desplazable con el teclado ya resuelto. Sin esto cada pantalla
 * reinventaba su propio header y el teclado tapaba los campos de abajo en iOS.
 */
export default function ScreenContainer({
  title,
  subtitle,
  headerRight,
  children,
  scroll = true,
  refreshControl,
}) {
  const { colors, spacing, typography } = useAppTheme();
  const Wrapper = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {title ? (
        <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.sm }]}>
          <View style={styles.titleCol}>
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Wrapper
          style={{ flex: 1 }}
          contentContainerStyle={
            scroll ? { padding: spacing.lg, paddingBottom: spacing.xl } : { flex: 1 }
          }
          {...(scroll ? { refreshControl, keyboardShouldPersistTaps: 'handled' } : {})}
        >
          {children}
        </Wrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleCol: { flex: 1 },
});
