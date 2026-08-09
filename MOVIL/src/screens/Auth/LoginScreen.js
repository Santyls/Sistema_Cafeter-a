import { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coffee } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { isEmpty, isValidEmail } from '../../utils/validators';
import { mostrarMensaje } from '../../utils/alerts';
import TextField from '../../components/common/TextField';
import Button from '../../components/common/Button';

export default function LoginScreen() {
  const { colors, radius, spacing, typography } = useAppTheme();
  const { login } = useAuth();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async () => {
    // Capa 1: validacion local, antes de gastar red.
    const nextErrors = {};
    if (isEmpty(correo)) nextErrors.correo = 'El correo es obligatorio.';
    else if (!isValidEmail(correo)) nextErrors.correo = 'Ingresa un correo electronico valido.';
    if (isEmpty(contrasena)) nextErrors.contrasena = 'La contrasena es obligatoria.';

    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setCargando(true);
    const resultado = await login(correo, contrasena);
    setCargando(false);
    if (!resultado.success) {
      setFormError(resultado.error);
      setContrasena('');
    }
  };

  const handleOlvido = () => {
    mostrarMensaje(
      'Restablecer contrasena',
      'Contacta al administrador de TI para restablecer tu contrasena.'
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { padding: spacing.lg }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.logoWrap}>
              <View
                style={[
                  styles.logo,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
                ]}
              >
                <Coffee size={40} color={colors.accent} />
              </View>
            </View>

            <Text style={[typography.h1, { color: colors.text, textAlign: 'center', marginTop: spacing.md }]}>
              CoffeeFlow Pro
            </Text>
            <Text
              style={[
                typography.body,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: spacing.xs,
                  marginBottom: spacing.lg,
                },
              ]}
            >
              Sistema de Gestion de Cafeteria
            </Text>

            <TextField
              label="Correo electronico"
              placeholder="correo@cafeteria.com"
              value={correo}
              onChangeText={setCorreo}
              error={errors.correo}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              label="Contrasena"
              placeholder="Ingrese su contrasena"
              value={contrasena}
              onChangeText={setContrasena}
              error={errors.contrasena}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleSubmit}
            />

            <Pressable style={{ alignSelf: 'flex-end', marginBottom: spacing.md }} onPress={handleOlvido}>
              <Text style={[typography.button, { color: colors.accent }]}>
                ¿Olvidaste tu contrasena?
              </Text>
            </Pressable>

            {formError ? (
              <Text style={[typography.small, { color: colors.danger, marginBottom: spacing.md }]}>
                {formError}
              </Text>
            ) : null}

            <Button
              title="Iniciar sesion"
              onPress={handleSubmit}
              loading={cargando}
              disabled={cargando}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center' },
  form: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  logoWrap: { alignItems: 'center' },
  logo: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
