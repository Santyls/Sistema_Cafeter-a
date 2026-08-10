import { memo, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Receipt, Wallet } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cajaApi } from '../../api/cajaApi';
import { pedidosApi } from '../../api/pedidosApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { moneda, hora } from '../../utils/format';
import { isValidMonto } from '../../utils/validators';
import { mostrarMensaje } from '../../utils/alerts';
import { etiquetaEstado, tonoEstado, origenDePedido } from '../../constants/pedidos';
import ScreenContainer from '../../components/common/ScreenContainer';
import PantallaLista from '../../components/common/PantallaLista';
import CampanaAvisos from '../../components/common/CampanaAvisos';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import TextField from '../../components/common/TextField';
import FilterTabs from '../../components/common/FilterTabs';

// Caja trabaja dos cosas distintas: pedidos recien capturados que hay que validar y
// mandar a cocina, y pedidos ya servidos que hay que cobrar.
const FILTROS = [
  { value: 'por_inyectar', label: 'Por validar' },
  { value: 'por_cobrar', label: 'Por cobrar' },
];

export default function CobrarScreen({ navigation }) {
  const { colors, spacing, typography } = useAppTheme();
  const { user } = useAuth();
  const [filtro, setFiltro] = useState('por_inyectar');
  const [fondo, setFondo] = useState('');
  const [errorFondo, setErrorFondo] = useState('');
  const [abriendo, setAbriendo] = useState(false);

  const cargarTodo = useCallback(async () => {
    const [cajas, pedidos] = await Promise.all([cajaApi.listar({ estado: 'abierto' }), pedidosApi.listar()]);
    return { cajas, pedidos };
  }, []);

  const { datos, cargando, error, recargar } = useCarga(cargarTodo, null, []);

  // La caja abierta del propio cajero: sin ella no se puede emitir ningun ticket.
  const cajaAbierta = useMemo(
    () => (datos?.cajas || []).find((c) => c.id_usuario === user?.id_usuario) || null,
    [datos, user]
  );

  const porInyectar = useMemo(
    () => (datos?.pedidos || []).filter((p) => p.estado === 'pendiente'),
    [datos]
  );

  // Solo se cobra lo que el mesero ya reporto como cuenta pedida: una mesa que sigue
  // consumiendo no debe aparecer aqui.
  const porCobrar = useMemo(
    () =>
      (datos?.pedidos || []).filter(
        (p) => ['listo', 'entregado'].includes(p.estado) && p.cuenta_solicitada && !p.pagado
      ),
    [datos]
  );

  const lista = filtro === 'por_inyectar' ? porInyectar : porCobrar;

  const opciones = FILTROS.map((f) => ({
    ...f,
    count: f.value === 'por_inyectar' ? porInyectar.length : porCobrar.length,
  }));

  const abrirTurno = async () => {
    if (!isValidMonto(fondo)) {
      setErrorFondo('Ingresa el monto con el que inicias el turno.');
      return;
    }

    setAbriendo(true);
    try {
      await cajaApi.abrir(Number(fondo), 'Turno iniciado desde la app movil');
      setFondo('');
      await recargar();
    } catch (e) {
      mostrarMensaje(
        'No se pudo abrir la caja',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setAbriendo(false);
    }
  };

  // Sin caja abierta no tiene sentido mostrar la lista: no se puede cobrar nada.
  if (!cargando && datos && !cajaAbierta) {
    return (
      <ScreenContainer title="Apertura de turno" subtitle="Configura tu caja para empezar">
        <Card>
          <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.md }]}>
            Antes de cobrar necesitas abrir tu caja con el fondo inicial. Ese monto es la base
            con la que se calcula tu corte al final del turno.
          </Text>
          <TextField
            label="Fondo inicial"
            placeholder="0.00"
            value={fondo}
            onChangeText={(v) => {
              setFondo(v);
              setErrorFondo('');
            }}
            error={errorFondo}
            keyboardType="numeric"
          />
          <Button
            title="Abrir caja"
            icon={Wallet}
            onPress={abrirTurno}
            loading={abriendo}
            disabled={abriendo}
          />
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <PantallaLista
      title="Caja"
      subtitle={cajaAbierta ? `Fondo inicial ${moneda(cajaAbierta.fondo_inicial)}` : ' '}
      headerRight={<CampanaAvisos onPress={() => navigation.navigate('Notificaciones')} />}
      datos={lista}
      keyExtractor={(p) => String(p.id_pedido)}
      renderItem={({ item }) => (
        <FilaCobro
          pedido={item}
          accion={filtro === 'por_inyectar' ? 'Validar y mandar a cocina' : 'Cobrar y emitir ticket'}
          onPress={(id) =>
            navigation.navigate('DetalleCobro', { id, idCaja: cajaAbierta?.id_caja })
          }
        />
      )}
      encabezado={
        <View style={{ marginBottom: spacing.sm }}>
          <FilterTabs options={opciones} value={filtro} onChange={setFiltro} />
        </View>
      }
      cargando={cargando}
      error={error}
      onReintentar={recargar}
      onRefresh={recargar}
      emptyIcon={Receipt}
      emptyTitle={filtro === 'por_inyectar' ? 'Nada por validar' : 'Nada por cobrar'}
      emptySubtitle={
        filtro === 'por_inyectar'
          ? 'Cuando un mesero capture un pedido aparecera aqui para validarlo.'
          : 'Los pedidos aparecen aqui cuando el mesero avisa que el cliente pidio la cuenta.'
      }
    />
  );
}

const FilaCobro = memo(function FilaCobro({ pedido, accion, onPress }) {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <Pressable onPress={() => onPress(pedido.id_pedido)}>
      <Card style={{ marginBottom: spacing.md }}>
        <View style={styles.topRow}>
          <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>
            {origenDePedido(pedido)} · #{pedido.id_pedido}
          </Text>
          <Badge label={etiquetaEstado(pedido.estado)} tone={tonoEstado(pedido.estado)} soft />
        </View>
        <View style={styles.metaRow}>
          <Text style={[typography.small, { color: colors.textSecondary, flex: 1 }]}>
            {pedido.usuario_nombre || 'Sin mesero'} · {hora(pedido.fecha_creacion)}
          </Text>
          <Text style={[typography.h3, { color: colors.text }]}>{moneda(pedido.total)}</Text>
        </View>
        <Text style={[typography.small, { color: colors.accent, marginTop: 6 }]}>{accion}</Text>
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
});
