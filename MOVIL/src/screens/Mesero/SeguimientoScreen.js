import { useMemo, useState } from 'react';
import { View, Text, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { pedidosApi } from '../../api/pedidosApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { moneda, hora } from '../../utils/format';
import { confirmar, mostrarMensaje } from '../../utils/alerts';
import { etiquetaEstado, tonoEstado } from '../../constants/pedidos';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FilterTabs from '../../components/common/FilterTabs';

const FILTROS = [
  { value: 'activos', label: 'En curso' },
  { value: 'listo', label: 'Listos para servir' },
  { value: 'todos', label: 'Todos' },
];

export default function SeguimientoScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const [filtro, setFiltro] = useState('activos');
  const [procesando, setProcesando] = useState(null);

  const { datos: pedidos, cargando, error, recargar } = useCarga(pedidosApi.listar, []);

  const abiertos = useMemo(
    () => (pedidos || []).filter((p) => !['entregado_pagado', 'cancelado'].includes(p.estado)),
    [pedidos]
  );

  const filtrados = useMemo(() => {
    if (filtro === 'listo') return abiertos.filter((p) => p.estado === 'listo');
    if (filtro === 'todos') return pedidos || [];
    return abiertos;
  }, [abiertos, pedidos, filtro]);

  const opciones = FILTROS.map((f) => ({
    ...f,
    count:
      f.value === 'listo'
        ? abiertos.filter((p) => p.estado === 'listo').length
        : f.value === 'activos'
        ? abiertos.length
        : (pedidos || []).length,
  }));

  const entregar = (pedido) => {
    confirmar(
      'Confirmar entrega',
      `¿Ya llevaste el pedido #${pedido.id_pedido} a la mesa ${pedido.mesa_numero}?`,
      async () => {
        setProcesando(pedido.id_pedido);
        try {
          await pedidosApi.cambiarEstado(pedido.id_pedido, 'entregado', 'Entregado en mesa');
          await recargar();
        } catch (e) {
          mostrarMensaje(
            'No se pudo actualizar',
            e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
          );
        } finally {
          setProcesando(null);
        }
      },
      'Si, entregado'
    );
  };

  return (
    <ScreenContainer
      title="Pedidos"
      subtitle="Seguimiento de tus mesas"
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
        emptyIcon={ClipboardList}
        emptyTitle="Sin pedidos en curso"
        emptySubtitle="Los pedidos que envies a caja apareceran aqui."
      >
        {filtrados.map((pedido) => (
          <Card key={pedido.id_pedido} style={{ marginBottom: spacing.md }}>
            <View style={styles.topRow}>
              <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>
                Mesa {pedido.mesa_numero} · #{pedido.id_pedido}
              </Text>
              <Badge label={etiquetaEstado(pedido.estado)} tone={tonoEstado(pedido.estado)} />
            </View>

            <View style={styles.metaRow}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 4, flex: 1 }]}>
                {hora(pedido.fecha_creacion)}
              </Text>
              <Text style={[typography.button, { color: colors.text }]}>{moneda(pedido.total)}</Text>
            </View>

            {pedido.estado === 'listo' ? (
              <View style={{ marginTop: spacing.sm }}>
                <Button
                  title="Marcar como entregado"
                  icon={CheckCircle2}
                  onPress={() => entregar(pedido)}
                  loading={procesando === pedido.id_pedido}
                  disabled={procesando !== null}
                />
              </View>
            ) : null}
          </Card>
        ))}
      </AsyncContent>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
});
