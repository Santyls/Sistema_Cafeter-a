import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'sentences',
  editable = true,
  multiline = false,
  onSubmitEditing,
  right,
}) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
            backgroundColor: editable ? colors.surface : colors.surfaceAlt,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          onSubmitEditing={onSubmitEditing}
          style={[
            typography.body,
            styles.input,
            { color: editable ? colors.text : colors.textSecondary },
            multiline && { minHeight: 88, textAlignVertical: 'top' },
          ]}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((prev) => !prev)} hitSlop={8}>
            {hidden ? (
              <Eye size={20} color={colors.textSecondary} />
            ) : (
              <EyeOff size={20} color={colors.textSecondary} />
            )}
          </Pressable>
        ) : (
          right
        )}
      </View>
      {error ? (
        <Text style={[typography.tiny, { color: colors.danger, marginTop: spacing.xs }]}>{error}</Text>
      ) : helper ? (
        <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 12 },
});
