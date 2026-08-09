import { Text, Pressable, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import EmptyState from './EmptyState';

/**
 * Los tres estados que toda lista de la app debe cubrir: cargando, error (tocable para
 * reintentar) y vacio. Centralizarlos evita que una pantalla se quede en blanco cuando
 * la API falla, que es lo que pasaba antes.
 */
export default function AsyncContent({
  cargando,
  error,
  onReintentar,
  vacio,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  children,
}) {
  const { colors, spacing, typography } = useAppTheme();

  if (cargando) {
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

  if (vacio) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} subtitle={emptySubtitle} />;
  }

  return children;
}
