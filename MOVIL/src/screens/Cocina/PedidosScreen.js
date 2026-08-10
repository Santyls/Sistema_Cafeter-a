import { useMemo, useState } from 'react';
import { View, Text, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { Bell, ChefHat, Clock } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { pedidosApi } from '../../api/pedidosApi';
import useCarga from '../../hooks/useCarga';
import { hora } from '../../utils/format';
import {
  etiquetaEstado,
  tonoEstado,
  origenDePedido,
  ESTADOS_ACTIVOS_COCINA,
} from '../../constants/pedidos';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import FilterTabs from '../../components/common/FilterTabs';

const FILTROS = [
  { value: 'en_cocina', label: 'Por tomar' },
  { value: 'en_preparacion', label: 'En preparacion' },
  { value: 'listo', label: 'Listos' },
  { value: 'todos', label: 'Todos' },
];

export default function PedidosScreen({ navigation }) {
  const { colors, spacing, typography } = useAppTheme();
  const [filtro, setFiltro] = useState('en_cocina');

  const { datos: pedidos, cargando, error, recargar } = useCarga(pedidosApi.listar, []);

  // Cocina solo trabaja los pedidos vivos; los cerrados viven en Historial.
  const activos = useMemo(
    () => (pedidos || []).filter((p) => ESTADOS_ACTIVOS_COCINA.includes(p.estado)),
    [pedidos]
  );

  const filtrados = useMemo(
    () => (filtro === 'todos' ? activos : activos.filter((p) => p.estado === filtro)),
    [activos, filtro]
  );

  const opciones = useMemo(
    () =>
      FILTROS.map((f) => ({
        ...f,
        count: f.value === 'todos' ? activos.length : activos.filter((p) => p.estado === f.value).length,
      })),
    [activos]
  );

  return (
    <ScreenContainer
      title="Pedidos"
      subtitle="Comandas activas en cocina"
      headerRight={
        <Pressable onPress={() => navigation.navigate('Notificaciones')} hitSlop={8}>
          <Bell size={22} color={colors.text} />
        </Pressable>
      }
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <View style={{ marginBottom: spacing.sm }}>
        <FilterTabs options={opciones} value={filtro} onChange={setFiltro} />
      </View>

      <AsyncContent
        cargando={cargando && !pedidos}
        error={error}
        onReintentar={recargar}
        vacio={filtrados.length === 0}
        emptyIcon={ChefHat}
        emptyTitle="Sin pedidos por preparar"
        emptySubtitle={
          filtro === 'en_cocina'
            ? 'Cuando caja valide un pedido aparecera aqui para tomarlo.'
            : 'No hay pedidos con ese filtro.'
        }
      >
        {filtrados.map((pedido) => (
          <Pressable
            key={pedido.id_pedido}
            onPress={() => navigation.navigate('DetallePedido', { id: pedido.id_pedido })}
          >
            <Card style={{ marginBottom: spacing.md }}>
              <View style={styles.topRow}>
                <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>
                  {origenDePedido(pedido)} · #{pedido.id_pedido}
                </Text>
                <Badge label={etiquetaEstado(pedido.estado)} tone={tonoEstado(pedido.estado)} />
              </View>

              <View style={styles.metaRow}>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 4 }]}>
                  Hora pedido: {hora(pedido.fecha_creacion)}
                </Text>
              </View>

              {pedido.observaciones ? (
                <Text style={[typography.small, { color: colors.accent, marginTop: 4 }]} numberOfLines={2}>
                  Nota: {pedido.observaciones}
                </Text>
              ) : null}
            </Card>
          </Pressable>
        ))}
      </AsyncContent>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
});
