import { useMemo, useState } from 'react';
import { View, Text, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { ClipboardList, Clock, ShoppingBag, LayoutGrid } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { pedidosApi } from '../../api/pedidosApi';
import useCarga from '../../hooks/useCarga';
import { moneda, hora } from '../../utils/format';
import {
  etiquetaEstado,
  tonoEstado,
  origenDePedido,
  ESTADOS_ACTIVOS,
  ESTADOS_CERRADOS,
  dentroDeVentanaVisible,
  DIAS_VISIBLES_FINALIZADOS,
} from '../../constants/pedidos';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import FilterTabs from '../../components/common/FilterTabs';

const FILTROS = [
  // El primer filtro es donde cae un pedido recien enviado: sin el, el mesero no
  // encontraba lo que acababa de mandar.
  { value: 'pendiente', label: 'En caja' },
  { value: 'en_cocina', label: 'En cocina' },
  { value: 'en_preparacion', label: 'En preparacion' },
  { value: 'listo', label: 'Listos para entregar' },
  { value: 'activos', label: 'Todos' },
  { value: 'finalizados', label: 'Finalizados' },
];

export default function SeguimientoScreen({ navigation }) {
  const { colors, spacing, typography } = useAppTheme();
  const [filtro, setFiltro] = useState('activos');

  const { datos: pedidos, cargando, error, recargar } = useCarga(pedidosApi.listar, []);

  const activos = useMemo(
    () => (pedidos || []).filter((p) => ESTADOS_ACTIVOS.includes(p.estado)),
    [pedidos]
  );

  // Los finalizados viejos se dejan de mostrar; el registro sigue en la base de datos.
  const finalizados = useMemo(
    () =>
      (pedidos || [])
        .filter((p) => ESTADOS_CERRADOS.includes(p.estado))
        .filter((p) => dentroDeVentanaVisible(p.fecha_creacion))
        .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)),
    [pedidos]
  );

  const filtrados = useMemo(() => {
    if (filtro === 'activos') return activos;
    if (filtro === 'finalizados') return finalizados;
    return activos.filter((p) => p.estado === filtro);
  }, [activos, finalizados, filtro]);

  const opciones = FILTROS.map((f) => ({
    ...f,
    count:
      f.value === 'activos'
        ? activos.length
        : f.value === 'finalizados'
        ? finalizados.length
        : activos.filter((p) => p.estado === f.value).length,
  }));

  return (
    <ScreenContainer
      title="Pedidos"
      subtitle="Toca un pedido para ver su detalle"
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <View style={{ marginBottom: spacing.sm }}>
        <FilterTabs options={opciones} value={filtro} onChange={setFiltro} />
      </View>

      {filtro === 'finalizados' ? (
        <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
          Los pedidos finalizados hace mas de {DIAS_VISIBLES_FINALIZADOS} dias dejan de aparecer
          aqui. El registro se conserva para las estadisticas del panel web.
        </Text>
      ) : null}

      <AsyncContent
        cargando={cargando && !pedidos}
        error={error}
        onReintentar={recargar}
        vacio={filtrados.length === 0}
        emptyIcon={ClipboardList}
        emptyTitle={filtro === 'finalizados' ? 'Sin pedidos finalizados' : 'Sin pedidos aqui'}
        emptySubtitle={
          filtro === 'finalizados'
            ? 'Aqui apareceran los pedidos entregados y cancelados del ultimo mes.'
            : 'Los pedidos que envies a caja apareceran aqui.'
        }
      >
        {filtrados.map((pedido) => {
          const esParaLlevar = pedido.tipo_pedido === 'para_llevar';
          const Icono = esParaLlevar ? ShoppingBag : LayoutGrid;

          return (
            <Pressable
              key={pedido.id_pedido}
              onPress={() => navigation.navigate('DetalleSeguimiento', { id: pedido.id_pedido })}
            >
              <Card style={{ marginBottom: spacing.md }}>
                <View style={styles.topRow}>
                  <Icono size={16} color={colors.textSecondary} />
                  <Text style={[typography.h3, { color: colors.text, flex: 1, marginLeft: 6 }]}>
                    {origenDePedido(pedido)} · #{pedido.id_pedido}
                  </Text>
                  <Badge label={etiquetaEstado(pedido.estado)} tone={tonoEstado(pedido.estado)} />
                </View>

                <View style={styles.metaRow}>
                  <Clock size={14} color={colors.textSecondary} />
                  <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 4, flex: 1 }]}>
                    {hora(pedido.fecha_creacion)}
                  </Text>
                  <Text style={[typography.button, { color: colors.text }]}>
                    {moneda(pedido.total)}
                  </Text>
                </View>

                {pedido.pagado ? (
                  <Text style={[typography.tiny, { color: colors.success, marginTop: 4 }]}>
                    Cobrado
                  </Text>
                ) : pedido.cuenta_solicitada ? (
                  <Text style={[typography.tiny, { color: colors.warning, marginTop: 4 }]}>
                    Cuenta solicitada, esperando cobro en caja
                  </Text>
                ) : null}
              </Card>
            </Pressable>
          );
        })}
      </AsyncContent>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
});
