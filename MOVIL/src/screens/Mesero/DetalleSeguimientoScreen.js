import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, CheckCircle2, ReceiptText } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { pedidosApi } from '../../api/pedidosApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { moneda, hora } from '../../utils/format';
import { confirmar, mostrarMensaje } from '../../utils/alerts';
import { etiquetaEstado, tonoEstado, origenDePedido } from '../../constants/pedidos';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgresoPedido from '../../components/common/ProgresoPedido';

export default function DetalleSeguimientoScreen({ route, navigation }) {
  const { id } = route.params;
  const { colors, spacing, typography } = useAppTheme();
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(() => pedidosApi.obtener(id), [id]);
  const { datos: pedido, cargando, error, recargar } = useCarga(cargar, null, [id]);

  const entregar = () => {
    confirmar(
      'Confirmar entrega',
      `¿Ya entregaste el pedido #${id} (${origenDePedido(pedido)})?`,
      async () => {
        setProcesando(true);
        try {
          await pedidosApi.cambiarEstado(id, 'entregado', 'Entregado al cliente');
          await recargar();
        } catch (e) {
          mostrarMensaje(
            'No se pudo actualizar',
            e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
          );
        } finally {
          setProcesando(false);
        }
      },
      'Si, entregado'
    );
  };

  const pedirCuenta = () => {
    confirmar(
      'Solicitar la cuenta',
      `Se avisara a caja que el cliente quiere pagar ${moneda(pedido.total)}.`,
      async () => {
        setProcesando(true);
        try {
          await pedidosApi.solicitarCuenta(id);
          await recargar();
          mostrarMensaje('Cuenta solicitada', 'Caja ya puede cobrar este pedido.');
        } catch (e) {
          mostrarMensaje(
            'No se pudo solicitar',
            e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
          );
        } finally {
          setProcesando(false);
        }
      },
      'Solicitar'
    );
  };

  const puedeEntregar = pedido?.estado === 'listo';
  const puedePedirCuenta =
    pedido && !pedido.cuenta_solicitada && !pedido.pagado && pedido.estado !== 'cancelado';

  return (
    <ScreenContainer
      title={`Pedido #${id}`}
      subtitle={pedido ? origenDePedido(pedido) : ' '}
    >
      <Pressable onPress={() => navigation.goBack()} style={[styles.volver, { marginBottom: spacing.md }]}>
        <ChevronLeft size={18} color={colors.accent} />
        <Text style={[typography.button, { color: colors.accent }]}>Volver a pedidos</Text>
      </Pressable>

      <AsyncContent cargando={cargando} error={error} onReintentar={recargar} vacio={!pedido}>
        {pedido ? (
          <>
            <Card style={{ marginBottom: spacing.md }}>
              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.small, { color: colors.textSecondary }]}>Levantado</Text>
                  <Text style={[typography.h3, { color: colors.text }]}>
                    {hora(pedido.fecha_creacion)}
                  </Text>
                </View>
                <Badge label={etiquetaEstado(pedido.estado)} tone={tonoEstado(pedido.estado)} />
              </View>
              <ProgresoPedido estado={pedido.estado} />
            </Card>

            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
              Productos
            </Text>
            <Card style={{ marginBottom: spacing.md }}>
              {pedido.detalles.map((d, i) => (
                <View
                  key={d.id_detalle}
                  style={[
                    styles.itemRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        typography.body,
                        { color: d.cancelado ? colors.textSecondary : colors.text },
                        d.cancelado && styles.tachado,
                      ]}
                    >
                      {d.cantidad}x {d.producto_nombre}
                    </Text>
                    {d.observaciones ? (
                      <Text style={[typography.small, { color: colors.accent, marginTop: 2 }]}>
                        {d.observaciones}
                      </Text>
                    ) : null}
                    {d.cancelado ? (
                      <Text style={[typography.small, { color: colors.danger, marginTop: 2 }]}>
                        Cocina no pudo prepararlo: {d.motivo_cancelacion}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      typography.body,
                      { color: colors.textSecondary },
                      d.cancelado && styles.tachado,
                    ]}
                  >
                    {moneda(d.subtotal)}
                  </Text>
                </View>
              ))}
              <View style={[styles.itemRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>Total</Text>
                <Text style={[typography.h3, { color: colors.text }]}>{moneda(pedido.total)}</Text>
              </View>
            </Card>

            {pedido.observaciones ? (
              <Card style={{ marginBottom: spacing.md }}>
                <Text style={[typography.small, { color: colors.textSecondary }]}>Nota del pedido</Text>
                <Text style={[typography.body, { color: colors.text, marginTop: 2 }]}>
                  {pedido.observaciones}
                </Text>
              </Card>
            ) : null}

            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
              Seguimiento
            </Text>
            <Card style={{ marginBottom: spacing.md }}>
              {pedido.historial.map((h) => (
                <View key={h.id_historial} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { color: colors.text }]}>
                      {etiquetaEstado(h.estado_nuevo)}
                    </Text>
                    {h.comentario ? (
                      <Text style={[typography.small, { color: colors.textSecondary }]}>
                        {h.comentario}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[typography.small, { color: colors.textSecondary }]}>
                    {hora(h.fecha_cambio)}
                  </Text>
                </View>
              ))}
            </Card>

            {puedeEntregar ? (
              <Button
                title="Marcar como entregado"
                icon={CheckCircle2}
                onPress={entregar}
                loading={procesando}
                disabled={procesando}
              />
            ) : null}

            {puedePedirCuenta ? (
              <View style={{ marginTop: puedeEntregar ? spacing.sm : 0 }}>
                <Button
                  title="Solicitar la cuenta"
                  variant="outline"
                  icon={ReceiptText}
                  onPress={pedirCuenta}
                  disabled={procesando}
                />
              </View>
            ) : pedido.pagado ? (
              <Text style={[typography.small, { color: colors.success, textAlign: 'center' }]}>
                Este pedido ya fue cobrado en caja.
              </Text>
            ) : pedido.cuenta_solicitada ? (
              <Text style={[typography.small, { color: colors.warning, textAlign: 'center' }]}>
                La cuenta ya fue solicitada. Caja se encarga del cobro.
              </Text>
            ) : null}
          </>
        ) : null}
      </AsyncContent>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  volver: { flexDirection: 'row', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  tachado: { textDecorationLine: 'line-through' },
});
