import { useMemo, useState } from 'react';
import { View, Text, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { Package, PackagePlus } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { inventarioApi } from '../../api/inventarioApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { isValidMonto } from '../../utils/validators';
import { mostrarMensaje } from '../../utils/alerts';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FilterTabs from '../../components/common/FilterTabs';
import FloatingModal from '../../components/common/FloatingModal';
import TextField from '../../components/common/TextField';

// El ingrediente no tiene categoria en la base, asi que el filtro util para cocina es
// el nivel de stock: es lo que decide si hay que reabastecer.
const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'bajo', label: 'Stock bajo' },
  { value: 'agotado', label: 'Agotados' },
];

function nivelDe(ingrediente) {
  const actual = Number(ingrediente.stock_actual) || 0;
  const minimo = Number(ingrediente.stock_minimo) || 0;
  if (actual <= 0) return 'agotado';
  if (actual < minimo) return 'bajo';
  return 'ok';
}

const ETIQUETA_NIVEL = {
  agotado: { label: 'Agotado', tone: 'danger' },
  bajo: { label: 'Stock bajo', tone: 'warning' },
  ok: { label: 'Suficiente', tone: 'success' },
};

export default function InventarioScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const [filtro, setFiltro] = useState('todos');
  const [seleccionado, setSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [errorCantidad, setErrorCantidad] = useState('');
  const [guardando, setGuardando] = useState(false);

  const { datos: ingredientes, cargando, error, recargar } = useCarga(inventarioApi.ingredientes, []);

  const activos = useMemo(() => (ingredientes || []).filter((i) => i.activo !== false), [ingredientes]);

  const filtrados = useMemo(
    () => (filtro === 'todos' ? activos : activos.filter((i) => nivelDe(i) === filtro)),
    [activos, filtro]
  );

  const opciones = useMemo(
    () =>
      FILTROS.map((f) => ({
        ...f,
        count: f.value === 'todos' ? activos.length : activos.filter((i) => nivelDe(i) === f.value).length,
      })),
    [activos]
  );

  const abrirReabastecer = (ingrediente) => {
    setSeleccionado(ingrediente);
    setCantidad('');
    setErrorCantidad('');
  };

  const reabastecer = async () => {
    const numero = Number(cantidad);
    if (!isValidMonto(cantidad) || numero <= 0) {
      setErrorCantidad('Ingresa una cantidad mayor a cero.');
      return;
    }

    setGuardando(true);
    try {
      await inventarioApi.reabastecer(seleccionado.id_ingrediente, numero);
      setSeleccionado(null);
      await recargar();
      mostrarMensaje(
        'Inventario actualizado',
        `Se agregaron ${numero} ${seleccionado.unidad_medida} de ${seleccionado.nombre}.`
      );
    } catch (e) {
      mostrarMensaje(
        'No se pudo reabastecer',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScreenContainer
      title="Inventario"
      subtitle="Insumos de cocina"
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <View style={{ marginBottom: spacing.sm }}>
        <FilterTabs options={opciones} value={filtro} onChange={setFiltro} />
      </View>

      <AsyncContent
        cargando={cargando && !ingredientes}
        error={error}
        onReintentar={recargar}
        vacio={filtrados.length === 0}
        emptyIcon={Package}
        emptyTitle="Sin insumos que mostrar"
        emptySubtitle="No hay ingredientes con ese filtro."
      >
        {filtrados.map((ingrediente) => {
          const nivel = nivelDe(ingrediente);
          return (
            <Card key={ingrediente.id_ingrediente} style={{ marginBottom: spacing.md }}>
              <View style={styles.topRow}>
                <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>{ingrediente.nombre}</Text>
                <Badge label={ETIQUETA_NIVEL[nivel].label} tone={ETIQUETA_NIVEL[nivel].tone} soft />
              </View>

              <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]}>
                {ingrediente.stock_actual} {ingrediente.unidad_medida} en existencia · minimo{' '}
                {ingrediente.stock_minimo} {ingrediente.unidad_medida}
              </Text>

              <View style={{ marginTop: spacing.sm }}>
                <Button
                  title="Reabastecer"
                  variant="outline"
                  icon={PackagePlus}
                  onPress={() => abrirReabastecer(ingrediente)}
                />
              </View>
            </Card>
          );
        })}
      </AsyncContent>

      <FloatingModal
        visible={!!seleccionado}
        onClose={() => setSeleccionado(null)}
        title={seleccionado ? `Reabastecer ${seleccionado.nombre}` : ''}
        scroll={false}
      >
        {seleccionado ? (
          <>
            <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.md }]}>
              Existencia actual: {seleccionado.stock_actual} {seleccionado.unidad_medida}
            </Text>
            <TextField
              label={`Cantidad a agregar (${seleccionado.unidad_medida})`}
              placeholder="0"
              value={cantidad}
              onChangeText={(v) => {
                setCantidad(v);
                setErrorCantidad('');
              }}
              error={errorCantidad}
              keyboardType="numeric"
            />
            <Button
              title="Registrar entrada"
              onPress={reabastecer}
              loading={guardando}
              disabled={guardando}
            />
          </>
        ) : null}
      </FloatingModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
});
