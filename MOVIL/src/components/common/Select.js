import { useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import FloatingModal from './FloatingModal';

export default function Select({
  label,
  value,
  onSelect,
  options,
  placeholder = 'Selecciona una opcion',
  error,
}) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          {
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Text style={[typography.body, { color: value ? colors.text : colors.textSecondary, flex: 1 }]}>
          {value || placeholder}
        </Text>
        <ChevronDown size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? (
        <Text style={[typography.tiny, { color: colors.danger, marginTop: spacing.xs }]}>{error}</Text>
      ) : null}

      <FloatingModal
        visible={open}
        onClose={() => setOpen(false)}
        title={label || 'Selecciona'}
        scroll={false}
      >
        <FlatList
          data={options}
          keyExtractor={(item) => String(item)}
          style={{ maxHeight: 320 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelect(item);
                setOpen(false);
              }}
              style={[styles.option, { borderBottomColor: colors.divider }]}
            >
              <Text style={[typography.body, { color: item === value ? colors.accent : colors.text }]}>
                {item}
              </Text>
              {item === value ? <Check size={18} color={colors.accent} /> : null}
            </Pressable>
          )}
        />
      </FloatingModal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
