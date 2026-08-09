import { View, Text, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

export default function EmptyState({ icon: Icon = Inbox, title, subtitle }) {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <View style={[styles.wrap, { paddingVertical: spacing.xl }]}>
      <Icon size={40} color={colors.textSecondary} />
      <Text style={[typography.h3, { color: colors.text, marginTop: spacing.sm, textAlign: 'center' }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            typography.small,
            { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
