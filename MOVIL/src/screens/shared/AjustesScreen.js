import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Moon, Sun, LogOut, Save, UserRound } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { ApiError } from '../../api/httpClient';
import useTurno from '../../hooks/useTurno';
import { iniciales } from '../../utils/format';
import { isEmpty, isValidTelefono } from '../../utils/validators';
import { confirmar, mostrarMensaje } from '../../utils/alerts';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import TextField from '../../components/common/TextField';

const NOMBRE_ROL = { mesero: 'Mesero', cocinero: 'Cocinero', cajero: 'Cajero' };

/**
 * Ajustes y Turno, igual para los tres roles. `PanelResumen` es el bloque de metricas
 * propio de cada modulo (produccion de cocina, cobros de caja, mesas del mesero), que
 * es lo unico que cambia entre ellos.
 */
export default function AjustesScreen({ PanelResumen }) {
  const { colors, spacing, typography, isDark, toggleScheme } = useAppTheme();
  const { user, logout, refreshUser } = useAuth();
  const turno = useTurno();

  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [apellido, setApellido] = useState(user?.apellido_paterno || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);

  const nombreCompleto = user ? `${user.nombre} ${user.apellido_paterno || ''}`.trim() : '';

  const guardar = async () => {
    const nextErrors = {};
    if (isEmpty(nombre)) nextErrors.nombre = 'El nombre es obligatorio.';
    if (isEmpty(apellido)) nextErrors.apellido = 'El apellido es obligatorio.';
    if (!isEmpty(telefono) && !isValidTelefono(telefono)) {
      nextErrors.telefono = 'El teléfono debe tener 10 digitos.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setGuardando(true);
    try {
      await authApi.actualizarPerfil({
        nombre: nombre.trim(),
        apellido_paterno: apellido.trim(),
        telefono: telefono.trim(),
      });
      await refreshUser();
      setEditando(false);
      mostrarMensaje('Perfil actualizado', 'Tus datos se guardaron correctamente.');
    } catch (e) {
      mostrarMensaje(
        'No se pudo guardar',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = () => {
    confirmar(
      'Finalizar jornada',
      `Llevas ${turno} en turno. Al finalizar se cerrara tu sesión.`,
      logout,
      'Finalizar',
      true
    );
  };

  return (
    <ScreenContainer
      title="Ajustes y Turno"
      subtitle="Tu perfil y tu jornada"
      headerRight={
        <Pressable onPress={toggleScheme} hitSlop={8}>
          {isDark ? <Sun size={22} color={colors.text} /> : <Moon size={22} color={colors.text} />}
        </Pressable>
      }
    >
      <Card style={[{ marginBottom: spacing.md }, styles.perfilCard]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={[typography.h2, { color: colors.textOnPrimary }]}>
            {iniciales(nombreCompleto)}
          </Text>
        </View>
        <Text style={[typography.h2, { color: colors.text, marginTop: spacing.sm }]}>
          {nombreCompleto}
        </Text>
        <Text style={[typography.small, { color: colors.textSecondary }]}>
          {NOMBRE_ROL[user?.rol] || user?.rol}
        </Text>
        <View style={{ marginTop: spacing.sm }}>
          <Badge label={`Turno activo · ${turno}`} tone="success" soft />
        </View>
      </Card>

      {PanelResumen ? <PanelResumen /> : null}

      <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
        Datos personales
      </Text>
      <Card style={{ marginBottom: spacing.md }}>
        {editando ? (
          <>
            <TextField label="Nombre" value={nombre} onChangeText={setNombre} error={errors.nombre} />
            <TextField
              label="Apellido paterno"
              value={apellido}
              onChangeText={setApellido}
              error={errors.apellido}
            />
            <TextField
              label="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              error={errors.telefono}
              keyboardType="phone-pad"
              helper="10 digitos, sin espacios"
            />
            <TextField
              label="Correo electrónico"
              value={user?.correo || ''}
              editable={false}
              helper="El correo solo lo puede cambiar el administrador."
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => {
                  setEditando(false);
                  setErrors({});
                  setNombre(user?.nombre || '');
                  setApellido(user?.apellido_paterno || '');
                  setTelefono(user?.telefono || '');
                }}
                style={{ flex: 1 }}
              />
              <Button
                title="Guardar"
                icon={Save}
                onPress={guardar}
                loading={guardando}
                disabled={guardando}
                style={{ flex: 1 }}
              />
            </View>
          </>
        ) : (
          <>
            <Dato label="Correo" valor={user?.correo} />
            <Dato label="Teléfono" valor={user?.telefono || 'Sin registrar'} />
            <Dato label="Usuario" valor={user?.usuario} />
            <View style={{ marginTop: spacing.sm }}>
              <Button
                title="Editar datos personales"
                variant="outline"
                icon={UserRound}
                onPress={() => setEditando(true)}
              />
            </View>
          </>
        )}
      </Card>

      <Button title="Finalizar jornada" variant="danger" icon={LogOut} onPress={cerrarSesion} />
    </ScreenContainer>
  );
}

function Dato({ label, valor }) {
  const { colors, typography } = useAppTheme();
  return (
    <View style={styles.fila}>
      <Text style={[typography.small, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[typography.body, { color: colors.text }]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  perfilCard: { alignItems: 'center' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});
