import { useMemo, useState } from 'react';
import { View, Text, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { ChevronLeft, TrendingDown, Plus } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { cajaApi } from '../../api/cajaApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { moneda, fechaCorta } from '../../utils/format';
import { isEmpty, isValidMonto } from '../../utils/validators';
import { mostrarMensaje } from '../../utils/alerts';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import TextField from '../../components/common/TextField';
import Select from '../../components/common/Select';
import FloatingModal from '../../components/common/FloatingModal';

const CATEGORIAS = ['Operacion', 'Mantenimiento', 'Insumos', 'Otros'];

export default function GastosScreen({ route, navigation }) {
  const { idCaja } = route.params || {};
  const { colors, spacing, typography } = useAppTheme();

  const [abierto, setAbierto] = useState(false);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);

  const { datos: gastos, cargando, error, recargar } = useCarga(cajaApi.gastos, []);

  const delTurno = useMemo(
    () => (gastos || []).filter((g) => !idCaja || g.id_caja === idCaja),
    [gastos, idCaja]
  );

  const total = delTurno.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);

  const registrar = async () => {
    const nextErrors = {};
    if (isEmpty(concepto)) nextErrors.concepto = 'Describe el gasto.';
    if (!isValidMonto(monto) || Number(monto) <= 0) nextErrors.monto = 'Ingresa un monto mayor a cero.';
    if (isEmpty(categoria)) nextErrors.categoria = 'Selecciona una categoría.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setGuardando(true);
    try {
      await cajaApi.crearGasto({
        id_caja: idCaja,
        concepto: concepto.trim(),
        monto: Number(monto),
        categoria,
      });
      setAbierto(false);
      setConcepto('');
      setMonto('');
      setCategoria('');
      await recargar();
    } catch (e) {
      mostrarMensaje(
        'No se pudo registrar',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScreenContainer
      title="Gastos"
      subtitle={`${delTurno.length} registrados · ${moneda(total)}`}
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <Pressable onPress={() => navigation.goBack()} style={[styles.volver, { marginBottom: spacing.md }]}>
        <ChevronLeft size={18} color={colors.accent} />
        <Text style={[typography.button, { color: colors.accent }]}>Volver al corte</Text>
      </Pressable>

      <View style={{ marginBottom: spacing.md }}>
        <Button title="Registrar gasto" variant="outline" icon={Plus} onPress={() => setAbierto(true)} />
      </View>

      <AsyncContent
        cargando={cargando && !gastos}
        error={error}
        onReintentar={recargar}
        vacio={delTurno.length === 0}
        emptyIcon={TrendingDown}
        emptyTitle="Sin gastos en este turno"
        emptySubtitle="Los gastos que registres se descuentan del efectivo en caja."
      >
        {delTurno.map((gasto) => (
          <Card key={gasto.id_gasto} style={{ marginBottom: spacing.md }}>
            <View style={styles.topRow}>
              <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>{gasto.concepto}</Text>
              <Text style={[typography.h3, { color: colors.danger }]}>- {moneda(gasto.monto)}</Text>
            </View>
            <View style={[styles.topRow, { marginTop: 6 }]}>
              {gasto.categoria ? <Badge label={gasto.categoria} tone="accent" soft /> : null}
              <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 8 }]}>
                {fechaCorta(gasto.fecha)}
              </Text>
            </View>
          </Card>
        ))}
      </AsyncContent>

      <FloatingModal
        visible={abierto}
        onClose={() => setAbierto(false)}
        title="Registrar gasto"
        scroll={false}
      >
        <TextField
          label="Concepto"
          placeholder="Compra de servilletas"
          value={concepto}
          onChangeText={(v) => {
            setConcepto(v);
            setErrors((p) => ({ ...p, concepto: undefined }));
          }}
          error={errors.concepto}
        />
        <TextField
          label="Monto"
          placeholder="0.00"
          value={monto}
          onChangeText={(v) => {
            setMonto(v);
            setErrors((p) => ({ ...p, monto: undefined }));
          }}
          error={errors.monto}
          keyboardType="numeric"
        />
        <Select
          label="Categoría"
          value={categoria}
          onSelect={(v) => {
            setCategoria(v);
            setErrors((p) => ({ ...p, categoria: undefined }));
          }}
          options={CATEGORIAS}
          error={errors.categoria}
        />
        <Button title="Guardar gasto" onPress={registrar} loading={guardando} disabled={guardando} />
      </FloatingModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  volver: { flexDirection: 'row', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center' },
});
