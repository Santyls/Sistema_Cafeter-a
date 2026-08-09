import { useCallback, useState } from 'react';
import { View, Text, RefreshControl, StyleSheet } from 'react-native';
import { CalendarClock, Plus, XCircle } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { catalogoApi } from '../../api/catalogoApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { fechaCorta, hora } from '../../utils/format';
import { isEmpty, isValidEmail } from '../../utils/validators';
import { confirmar, mostrarMensaje } from '../../utils/alerts';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TextField from '../../components/common/TextField';
import Select from '../../components/common/Select';
import FloatingModal from '../../components/common/FloatingModal';

export default function ReservacionesScreen() {
  const { colors, spacing, typography } = useAppTheme();

  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [personas, setPersonas] = useState('');
  const [fecha, setFecha] = useState('');
  const [mesa, setMesa] = useState('');
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cargarTodo = useCallback(async () => {
    const [reservaciones, mesas] = await Promise.all([catalogoApi.reservaciones(), catalogoApi.mesas()]);
    return { reservaciones, mesas };
  }, []);

  const { datos, cargando, error, recargar } = useCarga(cargarTodo, null, []);

  const reservaciones = datos?.reservaciones || [];
  const opcionesMesa = (datos?.mesas || []).map((m) => `Mesa ${m.numero_mesa}`);

  const crear = async () => {
    const nextErrors = {};
    if (isEmpty(nombre)) nextErrors.nombre = 'El nombre del cliente es obligatorio.';
    if (!isEmpty(correo) && !isValidEmail(correo)) nextErrors.correo = 'Correo no valido.';
    if (isEmpty(fecha)) nextErrors.fecha = 'Indica la fecha y hora (AAAA-MM-DD HH:MM).';
    if (isEmpty(mesa)) nextErrors.mesa = 'Selecciona una mesa.';
    const numPersonas = Number(personas);
    if (!Number.isInteger(numPersonas) || numPersonas <= 0) {
      nextErrors.personas = 'Indica cuantas personas son.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const numeroMesa = Number(String(mesa).replace('Mesa ', ''));
    const mesaElegida = (datos?.mesas || []).find((m) => m.numero_mesa === numeroMesa);

    setGuardando(true);
    try {
      await catalogoApi.crearReservacion({
        nombre_cliente: nombre.trim(),
        correo_cliente: correo.trim() || null,
        numero_personas: numPersonas,
        fecha_reservacion: fecha.trim(),
        id_mesa: mesaElegida?.id_mesa,
      });
      setAbierto(false);
      setNombre('');
      setCorreo('');
      setPersonas('');
      setFecha('');
      setMesa('');
      await recargar();
    } catch (e) {
      mostrarMensaje(
        'No se pudo reservar',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const cancelar = (reservacion) => {
    confirmar(
      'Cancelar reservacion',
      `Se cancelara la reservacion de ${reservacion.nombre_cliente}.`,
      async () => {
        try {
          await catalogoApi.cancelarReservacion(reservacion.id_reservacion);
          await recargar();
        } catch (e) {
          mostrarMensaje(
            'No se pudo cancelar',
            e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
          );
        }
      },
      'Si, cancelar',
      true
    );
  };

  return (
    <ScreenContainer
      title="Reservaciones"
      subtitle={`${reservaciones.length} registradas`}
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <View style={{ marginBottom: spacing.md }}>
        <Button title="Nueva reservacion" variant="outline" icon={Plus} onPress={() => setAbierto(true)} />
      </View>

      <AsyncContent
        cargando={cargando && !datos}
        error={error}
        onReintentar={recargar}
        vacio={reservaciones.length === 0}
        emptyIcon={CalendarClock}
        emptyTitle="Sin reservaciones"
        emptySubtitle="Las reservaciones que registres apareceran aqui."
      >
        {reservaciones.map((r) => (
          <Card key={r.id_reservacion} style={{ marginBottom: spacing.md }}>
            <View style={styles.topRow}>
              <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>{r.nombre_cliente}</Text>
              <Text style={[typography.small, { color: colors.textSecondary }]}>
                {r.numero_personas} {r.numero_personas === 1 ? 'persona' : 'personas'}
              </Text>
            </View>
            <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]}>
              {fechaCorta(r.fecha_reservacion)} · {hora(r.fecha_reservacion)}
              {r.mesa_numero ? ` · Mesa ${r.mesa_numero}` : ''}
            </Text>
            <View style={{ marginTop: spacing.sm }}>
              <Button title="Cancelar" variant="outline" icon={XCircle} onPress={() => cancelar(r)} />
            </View>
          </Card>
        ))}
      </AsyncContent>

      <FloatingModal visible={abierto} onClose={() => setAbierto(false)} title="Nueva reservacion">
        <TextField
          label="Nombre del cliente"
          value={nombre}
          onChangeText={(v) => {
            setNombre(v);
            setErrors((p) => ({ ...p, nombre: undefined }));
          }}
          error={errors.nombre}
        />
        <TextField
          label="Correo (opcional)"
          placeholder="cliente@correo.com"
          value={correo}
          onChangeText={(v) => {
            setCorreo(v);
            setErrors((p) => ({ ...p, correo: undefined }));
          }}
          error={errors.correo}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="Numero de personas"
          placeholder="4"
          value={personas}
          onChangeText={(v) => {
            setPersonas(v);
            setErrors((p) => ({ ...p, personas: undefined }));
          }}
          error={errors.personas}
          keyboardType="numeric"
        />
        <TextField
          label="Fecha y hora"
          placeholder="2026-08-15 14:30"
          value={fecha}
          onChangeText={(v) => {
            setFecha(v);
            setErrors((p) => ({ ...p, fecha: undefined }));
          }}
          error={errors.fecha}
          helper="Formato AAAA-MM-DD HH:MM"
        />
        <Select
          label="Mesa"
          value={mesa}
          onSelect={(v) => {
            setMesa(v);
            setErrors((p) => ({ ...p, mesa: undefined }));
          }}
          options={opcionesMesa}
          error={errors.mesa}
        />
        <Button title="Guardar reservacion" onPress={crear} loading={guardando} disabled={guardando} />
      </FloatingModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
});
