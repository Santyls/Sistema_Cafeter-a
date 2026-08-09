import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon: Icon,
  style,
}) {
  const { colors, radius, spacing, typography } = useAppTheme();

  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
      ? colors.danger
      : variant === 'success'
      ? colors.success
      : variant === 'outline'
      ? `${colors.accent}1F` // relleno tenue: sin esto el boton se pierde contra el fondo
      : 'transparent';

  // colors.accent esta calibrado distinto por tema (dorado oscuro en claro, dorado
  // claro en oscuro), asi que da buen contraste en ambos.
  const borderColor = variant === 'outline' ? colors.accent : 'transparent';
  const textColor =
    variant === 'outline' || variant === 'text' ? colors.accent : colors.textOnPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderRadius: radius.md,
          paddingVertical: variant === 'text' ? spacing.xs : spacing.md - 2,
          paddingHorizontal: spacing.lg,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={18} color={textColor} style={{ marginRight: spacing.xs }} /> : null}
          <Text style={[typography.button, { color: textColor, textAlign: 'center' }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center' },
});
