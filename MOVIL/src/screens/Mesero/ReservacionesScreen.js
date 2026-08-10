import { useCallback, useState } from 'react';
import { View, Text, RefreshControl, StyleSheet } from 'react-native';
import { CalendarClock, Plus, XCircle, Users } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { catalogoApi } from '../../api/catalogoApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { fechaCorta, hora } from '../../utils/format';
import { isEmpty, isValidTelefono } from '../../utils/validators';
import { confirmar, mostrarMensaje } from '../../utils/alerts';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import TextField from '../../components/common/TextField';
import Select from '../../components/common/Select';
import SelectorFechaHora from '../../components/common/SelectorFechaHora';
import FloatingModal from '../../components/common/FloatingModal';

export default function ReservacionesScreen() {
  const { colors, spacing, typography } = useAppTheme();

  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [personas, setPersonas] = useState('');
  const [fechaHora, setFechaHora] = useState(null);
  const [mesa, setMesa] = useState('');
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cargarTodo = useCallback(async () => {
    const [reservaciones, mesas] = await Promise.all([catalogoApi.reservaciones(), catalogoApi.mesas()]);
    return { reservaciones, mesas };
  }, []);

  const { datos, cargando, error, recargar } = useCarga(cargarTodo, null, []);

  const reservaciones = datos?.reservaciones || [];
  const mesas = datos?.mesas || [];
  const opcionesMesa = mesas.map((m) => `Mesa ${m.numero_mesa} (${m.capacidad} lugares)`);

  const limpiar = () => {
    setNombre('');
    setTelefono('');
    setPersonas('');
    setFechaHora(null);
    setMesa('');
    setErrors({});
  };

  const crear = async () => {
    const nextErrors = {};
    if (isEmpty(nombre)) nextErrors.nombre = 'El nombre del cliente es obligatorio.';
    if (isEmpty(telefono)) nextErrors.telefono = 'El telefono es obligatorio.';
    else if (!isValidTelefono(telefono)) nextErrors.telefono = 'El telefono debe tener 10 digitos.';
    if (!fechaHora) nextErrors.fechaHora = 'Selecciona la fecha y la hora.';
    if (isEmpty(mesa)) nextErrors.mesa = 'Selecciona una mesa.';

    const numPersonas = Number(personas);
    if (!Number.isInteger(numPersonas) || numPersonas <= 0) {
      nextErrors.personas = 'Indica cuantas personas son.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const numeroMesa = Number(String(mesa).replace('Mesa ', '').split(' ')[0]);
    const mesaElegida = mesas.find((m) => m.numero_mesa === numeroMesa);

    setGuardando(true);
    try {
      await catalogoApi.crearReservacion({
        nombre_cliente: nombre.trim(),
        telefono: telefono.replace(/[\s-]/g, ''),
        numero_personas: numPersonas,
        id_mesa: mesaElegida.id_mesa,
        fecha_hora: fechaHora.toISOString(),
      });
      setAbierto(false);
      limpiar();
      await recargar();
      mostrarMensaje('Reservacion registrada', 'La mesa quedara apartada para esa hora.');
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
      `Se cancelara la reservacion de ${reservacion.nombre_cliente} y la mesa quedara libre.`,
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
      subtitle={`${reservaciones.length} proximas`}
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <View style={{ marginBottom: spacing.md }}>
        <Button title="Reservar mesa" icon={Plus} onPress={() => setAbierto(true)} />
      </View>

      <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
        Una mesa reservada deja de aceptar pedidos 90 minutos antes de la hora apartada.
      </Text>

      <AsyncContent
        cargando={cargando && !datos}
        error={error}
        onReintentar={recargar}
        vacio={reservaciones.length === 0}
        emptyIcon={CalendarClock}
        emptyTitle="Sin reservaciones"
        emptySubtitle="Las mesas apartadas apareceran aqui."
      >
        {reservaciones.map((r) => (
          <Card key={r.id_reservacion} style={{ marginBottom: spacing.md }}>
            <View style={styles.topRow}>
              <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>{r.nombre_cliente}</Text>
              <Badge label={`Mesa ${r.mesa_numero}`} tone="accent" soft />
            </View>

            <Text style={[typography.body, { color: colors.text, marginTop: 6 }]}>
              {fechaCorta(r.fecha_hora)} · {hora(r.fecha_hora)}
            </Text>

            <View style={[styles.topRow, { marginTop: 4 }]}>
              <Users size={13} color={colors.textSecondary} />
              <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 4, flex: 1 }]}>
                {r.numero_personas} {r.numero_personas === 1 ? 'persona' : 'personas'} · {r.telefono}
              </Text>
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <Button title="Cancelar" variant="outline" icon={XCircle} onPress={() => cancelar(r)} />
            </View>
          </Card>
        ))}
      </AsyncContent>

      <FloatingModal
        visible={abierto}
        onClose={() => {
          setAbierto(false);
          limpiar();
        }}
        title="Reservar mesa"
      >
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
          label="Telefono"
          placeholder="4421234567"
          value={telefono}
          onChangeText={(v) => {
            setTelefono(v);
            setErrors((p) => ({ ...p, telefono: undefined }));
          }}
          error={errors.telefono}
          keyboardType="phone-pad"
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
        <SelectorFechaHora
          label="Fecha y hora"
          value={fechaHora}
          onChange={(v) => {
            setFechaHora(v);
            setErrors((p) => ({ ...p, fechaHora: undefined }));
          }}
          error={errors.fechaHora}
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
