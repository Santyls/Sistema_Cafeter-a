import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

/**
 * Etiqueta de estado (pendiente, en preparacion, listo...). `tone` es una clave de
 * la paleta; `soft` la pinta como relleno tenue en vez de solida, para cuando va
 * dentro de una tarjeta y un bloque de color saturado pesaria demasiado.
 */
export default function Badge({ label, tone = 'accent', soft = false }) {
  const { colors, radius, typography } = useAppTheme();
  const color = colors[tone] || colors.accent;

  return (
    <View
      style={[
        styles.badge,
        {
          borderRadius: radius.pill,
          backgroundColor: soft ? `${color}22` : color,
        },
      ]}
    >
      <Text style={[typography.tiny, { color: soft ? color : colors.textOnPrimary, fontSize: 12 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
});
