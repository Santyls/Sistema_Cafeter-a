import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

export default function FloatingModal({ visible, onClose, title, children, scroll = true }) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const Content = scroll ? ScrollView : View;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.headerRow}>
            {title ? (
              <Text style={[typography.h2, { color: colors.text, flex: 1 }]}>{title}</Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Content style={{ marginTop: spacing.sm }}>{children}</Content>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { maxHeight: '85%', width: '100%', maxWidth: 520, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
});
