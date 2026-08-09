import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import Card from './Card';

export default function StatBox({ icon: Icon, value, label, tone, onPress }) {
  const { colors, spacing, typography } = useAppTheme();
  const iconColor = tone ? colors[tone] || colors.accent : colors.accent;

  const contenido = (
    <Card style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
        <Icon size={20} color={iconColor} />
      </View>
      <Text style={[typography.h1, { color: colors.text, marginTop: spacing.xs }]}>{value}</Text>
      <Text style={[typography.small, { color: colors.textSecondary }]}>{label}</Text>
    </Card>
  );

  if (!onPress) return contenido;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {contenido}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
