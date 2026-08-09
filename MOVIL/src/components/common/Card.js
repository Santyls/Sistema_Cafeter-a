import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

export default function Card({ children, style }) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: colors.border,
          padding: spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth },
});
