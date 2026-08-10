import { memo, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { History, Clock } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { pedidosApi } from '../../api/pedidosApi';
import useCarga from '../../hooks/useCarga';
import { hora, moneda, fechaCorta } from '../../utils/format';
import {
  etiquetaEstado,
  tonoEstado,
  origenDePedido,
  ESTADOS_CERRADOS,
  dentroDeVentanaVisible,
  DIAS_VISIBLES_FINALIZADOS,
} from '../../constants/pedidos';
import PantallaLista from '../../components/common/PantallaLista';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import FilterTabs from '../../components/common/FilterTabs';

/**
 * Los rangos se calculan contra la fecha de hoy, nunca contra fechas fijas: el
 * historial debe seguir siendo correcto sin tocar el codigo.
 */
function rangoDe(id) {
  const hoy = new Date();
  const inicio = new Date(hoy);

  if (id === 'ayer') {
    inicio.setDate(hoy.getDate() - 1);
    const fin = new Date(inicio);
    return { desde: inicio, hasta: fin };
  }
  if (id === 'semana') inicio.setDate(hoy.getDate() - 6);
  if (id === 'mes') inicio.setDate(1);

  return { desde: inicio, hasta: hoy };
}

const OPCIONES = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'ayer', label: 'Ayer' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
];

const RESULTADOS = [
  { value: 'entregado', label: 'Entregados' },
  { value: 'cancelado', label: 'Cancelados' },
];

export default function HistorialScreen({ navigation }) {
  const { colors, spacing, typography } = useAppTheme();
  const [rango, setRango] = useState('hoy');
  const [resultado, setResultado] = useState('entregado');

  const { datos: pedidos, cargando, error, recargar } = useCarga(pedidosApi.listar, []);

  const { desde, hasta } = useMemo(() => rangoDe(rango), [rango]);

  // Solo lo cerrado y dentro de la ventana visible: el registro completo vive en la
  // base de datos para las estadisticas del panel web.
  const cerrados = useMemo(
    () =>
      (pedidos || [])
        .filter((p) => ESTADOS_CERRADOS.includes(p.estado))
        .filter((p) => dentroDeVentanaVisible(p.fecha_creacion)),
    [pedidos]
  );

  const filtrados = useMemo(() => {
    const desdeStr = desde.toLocaleDateString('sv-SE');
    const hastaStr = hasta.toLocaleDateString('sv-SE');

    return cerrados
      .filter((p) => p.estado === resultado)
      .filter((p) => {
        if (!p.fecha_creacion) return false;
        const fecha = new Date(p.fecha_creacion).toLocaleDateString('sv-SE');
        return fecha >= desdeStr && fecha <= hastaStr;
      })
      .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
  }, [cerrados, resultado, desde, hasta]);

  const opcionesResultado = RESULTADOS.map((r) => ({
    ...r,
    count: cerrados.filter((p) => p.estado === r.value).length,
  }));

  const etiquetaRango =
    rango === 'hoy'
      ? `Hoy · ${fechaCorta(hasta)}`
      : rango === 'ayer'
      ? `Ayer · ${fechaCorta(desde)}`
      : `${fechaCorta(desde)} - ${fechaCorta(hasta)}`;

  return (
    <PantallaLista
      title="Historial"
      subtitle={etiquetaRango}
      encabezado={
        <>
          <View style={{ marginBottom: spacing.xs }}>
            <FilterTabs options={opcionesResultado} value={resultado} onChange={setResultado} />
          </View>
          <View style={{ marginBottom: spacing.sm }}>
            <FilterTabs options={OPCIONES} value={rango} onChange={setRango} />
          </View>

          <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Los pedidos de mas de {DIAS_VISIBLES_FINALIZADOS} dias dejan de aparecer en cocina. El
            registro se conserva para las estadisticas del panel web.
          </Text>
        </>
      }
      datos={filtrados}
      keyExtractor={(p) => String(p.id_pedido)}
      renderItem={({ item }) => (
        <FilaHistorial
          pedido={item}
          onPress={(id) => navigation.navigate('DetallePedido', { id })}
        />
      )}
      cargando={cargando}
      error={error}
      onReintentar={recargar}
      onRefresh={recargar}
      emptyIcon={History}
      emptyTitle={resultado === 'cancelado' ? 'Sin cancelados' : 'Sin entregados'}
      emptySubtitle="Prueba con otro rango de fechas."
    />
  );
}

const FilaHistorial = memo(function FilaHistorial({ pedido, onPress }) {
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
          <Clock size={14} color={colors.textSecondary} />
          <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 4, flex: 1 }]}>
            {fechaCorta(pedido.fecha_creacion)} · {hora(pedido.fecha_creacion)}
          </Text>
          <Text style={[typography.button, { color: colors.text }]}>{moneda(pedido.total)}</Text>
        </View>
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
});
