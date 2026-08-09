import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

/**
 * Filtros en pildoras. `options` acepta strings o { value, label, count } para
 * mostrar cuantos elementos caen en cada filtro sin tener que abrirlo.
 */
export default function FilterTabs({ options, value, onChange }) {
  const { colors, radius, typography } = useAppTheme();

  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const opcion = typeof option === 'string' ? { value: option, label: option } : option;
        const selected = opcion.value === value;
        return (
          <Pressable
            key={opcion.value}
            onPress={() => onChange(opcion.value)}
            style={[
              styles.pill,
              {
                borderRadius: radius.pill,
                backgroundColor: selected ? colors.accent : colors.surfaceAlt,
                borderColor: selected ? colors.accent : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.button,
                { color: selected ? colors.textOnPrimary : colors.textSecondary },
              ]}
            >
              {opcion.label}
              {opcion.count !== undefined ? ` (${opcion.count})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
});
