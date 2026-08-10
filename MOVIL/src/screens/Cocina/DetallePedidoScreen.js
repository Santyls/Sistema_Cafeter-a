import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, Play, Check, XCircle } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { pedidosApi } from '../../api/pedidosApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { hora, moneda } from '../../utils/format';
import { confirmar, mostrarMensaje } from '../../utils/alerts';
import { etiquetaEstado, tonoEstado, origenDePedido } from '../../constants/pedidos';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FloatingModal from '../../components/common/FloatingModal';
import TextField from '../../components/common/TextField';

// Cocina solo puede avanzar el pedido en un sentido; la API valida lo mismo del lado
// del servidor (maquina de estados), esto es para no ofrecer botones que van a fallar.
const SIGUIENTE_ESTADO = {
  en_cocina: { estado: 'en_preparacion', titulo: 'Tomar e iniciar preparacion', icono: Play },
  en_preparacion: { estado: 'listo', titulo: 'Marcar como listo', icono: Check },
};

export default function DetallePedidoScreen({ route, navigation }) {
  const { id } = route.params;
  const { colors, spacing, typography } = useAppTheme();
  const [procesando, setProcesando] = useState(false);
  const [porCancelar, setPorCancelar] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [errorMotivo, setErrorMotivo] = useState('');

  const cargar = useCallback(() => pedidosApi.obtener(id), [id]);
  const { datos: pedido, cargando, error, recargar } = useCarga(cargar, null, [id]);

  const siguiente = pedido ? SIGUIENTE_ESTADO[pedido.estado] : null;

  // Cocina solo puede rechazar un producto mientras el pedido siga en sus manos.
  const puedeCancelarProductos = ['en_cocina', 'en_preparacion', 'listo'].includes(pedido?.estado);

  const cancelarProducto = async () => {
    if (motivo.trim().length < 3) {
      setErrorMotivo('Escribe el motivo (minimo 3 letras).');
      return;
    }

    setProcesando(true);
    try {
      await pedidosApi.cancelarDetalle(id, porCancelar.id_detalle, motivo.trim());
      setPorCancelar(null);
      setMotivo('');
      await recargar();
      mostrarMensaje(
        'Producto cancelado',
        `Se aviso al mesero y ${porCancelar.producto_nombre} ya no se va a cobrar.`
      );
    } catch (e) {
      mostrarMensaje(
        'No se pudo cancelar',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setProcesando(false);
    }
  };

  const avanzar = async () => {
    setProcesando(true);
    try {
      await pedidosApi.cambiarEstado(id, siguiente.estado);
      await recargar();
    } catch (e) {
      mostrarMensaje(
        'No se pudo actualizar',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setProcesando(false);
    }
  };

  const cancelar = () => {
    confirmar(
      'Cancelar pedido',
      `Se cancelara el pedido #${id} y se repondra el inventario descontado.`,
      async () => {
        setProcesando(true);
        try {
          await pedidosApi.cancelar(id, 'Cancelado desde cocina');
          navigation.goBack();
        } catch (e) {
          mostrarMensaje(
            'No se pudo cancelar',
            e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
          );
        } finally {
          setProcesando(false);
        }
      },
      'Si, cancelar',
      true
    );
  };

  return (
    <ScreenContainer title={`Pedido #${id}`} subtitle={pedido ? origenDePedido(pedido) : ' '}>
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
                  <Text style={[typography.small, { color: colors.textSecondary }]}>Hora pedido</Text>
                  <Text style={[typography.h3, { color: colors.text }]}>{hora(pedido.fecha_creacion)}</Text>
                </View>
                <Badge label={etiquetaEstado(pedido.estado)} tone={tonoEstado(pedido.estado)} />
              </View>
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                Atiende: {pedido.usuario_nombre || 'Sin asignar'}
              </Text>
            </Card>

            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
              Productos a preparar
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
                        Cancelado: {d.motivo_cancelacion}
                      </Text>
                    ) : puedeCancelarProductos ? (
                      <Pressable onPress={() => setPorCancelar(d)} style={{ marginTop: 4 }}>
                        <Text style={[typography.small, { color: colors.danger }]}>
                          No puedo prepararlo
                        </Text>
                      </Pressable>
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
                <Text style={[typography.small, { color: colors.textSecondary }]}>Nota del mesero</Text>
                <Text style={[typography.body, { color: colors.text, marginTop: 2 }]}>
                  {pedido.observaciones}
                </Text>
              </Card>
            ) : null}

            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
              Seguimiento
            </Text>
            <Card style={{ marginBottom: spacing.lg }}>
              {pedido.historial.map((h, i) => (
                <View key={h.id_historial} style={[styles.itemRow, i > 0 && { paddingTop: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { color: colors.text }]}>
                      {etiquetaEstado(h.estado_nuevo)}
                    </Text>
                    {h.comentario ? (
                      <Text style={[typography.small, { color: colors.textSecondary }]}>{h.comentario}</Text>
                    ) : null}
                  </View>
                  <Text style={[typography.small, { color: colors.textSecondary }]}>
                    {hora(h.fecha_cambio)}
                  </Text>
                </View>
              ))}
            </Card>

            {siguiente ? (
              <Button
                title={siguiente.titulo}
                icon={siguiente.icono}
                onPress={avanzar}
                loading={procesando}
                disabled={procesando}
              />
            ) : (
              <Text style={[typography.small, { color: colors.textSecondary, textAlign: 'center' }]}>
                Este pedido ya salio de cocina.
              </Text>
            )}

            {pedido.estado === 'en_cocina' || pedido.estado === 'en_preparacion' ? (
              <View style={{ marginTop: spacing.sm }}>
                <Button
                  title="Cancelar pedido"
                  variant="outline"
                  icon={XCircle}
                  onPress={cancelar}
                  disabled={procesando}
                />
              </View>
            ) : null}
          </>
        ) : null}
      </AsyncContent>

      <FloatingModal
        visible={!!porCancelar}
        onClose={() => {
          setPorCancelar(null);
          setMotivo('');
          setErrorMotivo('');
        }}
        title="Cancelar producto"
        scroll={false}
      >
        {porCancelar ? (
          <>
            <Text style={[typography.body, { color: colors.text, marginBottom: spacing.xs }]}>
              {porCancelar.cantidad}x {porCancelar.producto_nombre}
            </Text>
            <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.md }]}>
              El resto del pedido sigue su curso y este producto no se le cobra al cliente. El
              mesero recibe el aviso con tu motivo.
            </Text>
            <TextField
              label="Motivo"
              placeholder="Se acabo el pan de la casa"
              value={motivo}
              onChangeText={(v) => {
                setMotivo(v);
                setErrorMotivo('');
              }}
              error={errorMotivo}
              multiline
            />
            <Button
              title="Cancelar producto"
              variant="danger"
              onPress={cancelarProducto}
              loading={procesando}
              disabled={procesando}
            />
          </>
        ) : null}
      </FloatingModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  volver: { flexDirection: 'row', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  tachado: { textDecorationLine: 'line-through' },
});
