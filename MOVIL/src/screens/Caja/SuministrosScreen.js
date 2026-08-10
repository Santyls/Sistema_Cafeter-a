import { useMemo, useState } from 'react';
import { View, Text, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { ChevronLeft, Truck, Plus } from 'lucide-react-native';
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

const ESTADOS = ['pendiente', 'recibido', 'cancelado'];

const TONO_ESTADO = { pendiente: 'warning', recibido: 'success', cancelado: 'danger' };

export default function SuministrosScreen({ route, navigation }) {
  const { idCaja } = route.params || {};
  const { colors, spacing, typography } = useAppTheme();

  const [abierto, setAbierto] = useState(false);
  const [proveedor, setProveedor] = useState('');
  const [total, setTotal] = useState('');
  const [factura, setFactura] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);

  const { datos: compras, cargando, error, recargar } = useCarga(cajaApi.compras, []);

  const delTurno = useMemo(
    () => (compras || []).filter((c) => !idCaja || c.id_caja === idCaja),
    [compras, idCaja]
  );

  const suma = delTurno.reduce((acc, c) => acc + (Number(c.total) || 0), 0);

  const registrar = async () => {
    const nextErrors = {};
    if (isEmpty(proveedor)) nextErrors.proveedor = 'Indica el proveedor.';
    if (!isValidMonto(total) || Number(total) <= 0) nextErrors.total = 'Ingresa un monto mayor a cero.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setGuardando(true);
    try {
      await cajaApi.crearCompra({
        id_caja: idCaja,
        proveedor: proveedor.trim(),
        total: Number(total),
        factura: factura.trim() || null,
        estado,
      });
      setAbierto(false);
      setProveedor('');
      setTotal('');
      setFactura('');
      setEstado('pendiente');
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
      title="Suministros"
      subtitle={`${delTurno.length} compras · ${moneda(suma)}`}
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <Pressable onPress={() => navigation.goBack()} style={[styles.volver, { marginBottom: spacing.md }]}>
        <ChevronLeft size={18} color={colors.accent} />
        <Text style={[typography.button, { color: colors.accent }]}>Volver al corte</Text>
      </Pressable>

      <View style={{ marginBottom: spacing.md }}>
        <Button title="Registrar compra" variant="outline" icon={Plus} onPress={() => setAbierto(true)} />
      </View>

      <AsyncContent
        cargando={cargando && !compras}
        error={error}
        onReintentar={recargar}
        vacio={delTurno.length === 0}
        emptyIcon={Truck}
        emptyTitle="Sin compras registradas"
        emptySubtitle="Aquí se registran las compras a proveedores del turno."
      >
        {delTurno.map((compra) => (
          <Card key={compra.id_compra} style={{ marginBottom: spacing.md }}>
            <View style={styles.topRow}>
              <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>
                {compra.proveedor || 'Proveedor sin nombre'}
              </Text>
              <Text style={[typography.h3, { color: colors.text }]}>{moneda(compra.total)}</Text>
            </View>
            <View style={[styles.topRow, { marginTop: 6 }]}>
              <Badge label={compra.estado || 'pendiente'} tone={TONO_ESTADO[compra.estado] || 'accent'} soft />
              <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 8, flex: 1 }]}>
                {compra.factura ? `${compra.factura} · ` : ''}
                {fechaCorta(compra.fecha)}
              </Text>
            </View>
          </Card>
        ))}
      </AsyncContent>

      <FloatingModal
        visible={abierto}
        onClose={() => setAbierto(false)}
        title="Registrar compra"
        scroll={false}
      >
        <TextField
          label="Proveedor"
          placeholder="Cafe Premium SA"
          value={proveedor}
          onChangeText={(v) => {
            setProveedor(v);
            setErrors((p) => ({ ...p, proveedor: undefined }));
          }}
          error={errors.proveedor}
        />
        <TextField
          label="Total"
          placeholder="0.00"
          value={total}
          onChangeText={(v) => {
            setTotal(v);
            setErrors((p) => ({ ...p, total: undefined }));
          }}
          error={errors.total}
          keyboardType="numeric"
        />
        <TextField
          label="Factura (opcional)"
          placeholder="FAC-001"
          value={factura}
          onChangeText={setFactura}
          autoCapitalize="characters"
        />
        <Select label="Estado" value={estado} onSelect={setEstado} options={ESTADOS} />
        <Button title="Guardar compra" onPress={registrar} loading={guardando} disabled={guardando} />
      </FloatingModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  volver: { flexDirection: 'row', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center' },
});
