import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

/**
 * Selector que se despliega en el mismo lugar, no en un modal.
 *
 * Antes abria un <Modal>, pero casi siempre se usa DENTRO de otro modal (registrar un
 * gasto, reservar una mesa) y dos <Modal> a la vez rompen la app en Android/iOS: el de
 * arriba queda detras y salir de la pantalla la congela. Desplegarse en linea evita el
 * problema por completo.
 */
export default function Select({
  label,
  value,
  onSelect,
  options,
  placeholder = 'Selecciona una opcion',
  error,
}) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const [abierto, setAbierto] = useState(false);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => setAbierto((v) => !v)}
        style={[
          styles.campo,
          {
            borderColor: error ? colors.danger : abierto ? colors.accent : colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Text style={[typography.body, { color: value ? colors.text : colors.textSecondary, flex: 1 }]}>
          {value || placeholder}
        </Text>
        {abierto ? (
          <ChevronUp size={18} color={colors.accent} />
        ) : (
          <ChevronDown size={18} color={colors.textSecondary} />
        )}
      </Pressable>

      {abierto ? (
        <View
          style={[
            styles.opciones,
            {
              borderColor: colors.border,
              borderRadius: radius.md,
              backgroundColor: colors.surface,
              marginTop: spacing.xs,
            },
          ]}
        >
          {options.map((opcion, i) => {
            const elegida = opcion === value;
            return (
              <Pressable
                key={String(opcion)}
                onPress={() => {
                  onSelect(opcion);
                  setAbierto(false);
                }}
                style={[
                  styles.opcion,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider },
                ]}
              >
                <Text
                  style={[typography.body, { color: elegida ? colors.accent : colors.text, flex: 1 }]}
                >
                  {opcion}
                </Text>
                {elegida ? <Check size={18} color={colors.accent} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {error ? (
        <Text style={[typography.tiny, { color: colors.danger, marginTop: spacing.xs }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  opciones: { borderWidth: 1, overflow: 'hidden' },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});
