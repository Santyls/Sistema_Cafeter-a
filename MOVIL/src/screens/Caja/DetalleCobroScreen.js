import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, ChefHat, CreditCard, Banknote, Smartphone } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { pedidosApi } from '../../api/pedidosApi';
import { cajaApi } from '../../api/cajaApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { moneda, hora } from '../../utils/format';
import { isValidMonto } from '../../utils/validators';
import { confirmar, mostrarMensaje } from '../../utils/alerts';
import { etiquetaEstado, tonoEstado } from '../../constants/pedidos';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import TextField from '../../components/common/TextField';

const METODOS = [
  { value: 'efectivo', label: 'Efectivo', icono: Banknote },
  { value: 'tarjeta', label: 'Tarjeta', icono: CreditCard },
  { value: 'transferencia', label: 'Transferencia', icono: Smartphone },
];

export default function DetalleCobroScreen({ route, navigation }) {
  const { id, idCaja } = route.params;
  const { colors, radius, spacing, typography } = useAppTheme();

  const [metodo, setMetodo] = useState('efectivo');
  const [recibido, setRecibido] = useState('');
  const [errorRecibido, setErrorRecibido] = useState('');
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(() => pedidosApi.obtener(id), [id]);
  const { datos: pedido, cargando, error, recargar } = useCarga(cargar, null, [id]);

  const total = Number(pedido?.total) || 0;
  const cambio = metodo === 'efectivo' ? Math.max(0, (Number(recibido) || 0) - total) : 0;

  const inyectar = () => {
    confirmar(
      'Validar e inyectar',
      `El pedido #${id} pasara a cocina y se descontara el inventario correspondiente.`,
      async () => {
        setProcesando(true);
        try {
          await pedidosApi.inyectar(id);
          mostrarMensaje('Pedido inyectado', 'Cocina ya fue notificada del pedido.');
          navigation.goBack();
        } catch (e) {
          mostrarMensaje(
            'No se pudo inyectar',
            e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
          );
        } finally {
          setProcesando(false);
        }
      },
      'Inyectar'
    );
  };

  const cobrar = async () => {
    if (!idCaja) {
      mostrarMensaje('Sin caja abierta', 'Abre tu caja antes de emitir un ticket.');
      return;
    }
    if (metodo === 'efectivo') {
      if (!isValidMonto(recibido)) {
        setErrorRecibido('Ingresa el monto recibido.');
        return;
      }
      if (Number(recibido) < total) {
        setErrorRecibido(`El monto recibido no cubre el total (${moneda(total)}).`);
        return;
      }
    }

    setProcesando(true);
    try {
      const ticket = await cajaApi.crearTicket({ id_pedido: id, id_caja: idCaja, total });
      await cajaApi.registrarPago({
        id_ticket: ticket.id_ticket,
        monto: total,
        tipo_pago: metodo,
        cambio,
      });
      // El pedido se cierra solo cuando el cobro quedo registrado, nunca antes.
      await pedidosApi.cambiarEstado(id, 'entregado_pagado', `Cobrado en ${metodo}`);

      navigation.replace('TicketEmitido', {
        folio: ticket.folio,
        idTicket: ticket.id_ticket,
        total,
        metodo,
        cambio,
        mesa: pedido.mesa_numero,
        detalles: pedido.detalles,
      });
    } catch (e) {
      mostrarMensaje(
        'No se pudo cobrar',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setProcesando(false);
    }
  };

  const esPorValidar = pedido?.estado === 'pendiente';

  return (
    <ScreenContainer
      title={`Pedido #${id}`}
      subtitle={pedido ? `Mesa ${pedido.mesa_numero}` : ' '}
    >
      <Pressable onPress={() => navigation.goBack()} style={[styles.volver, { marginBottom: spacing.md }]}>
        <ChevronLeft size={18} color={colors.accent} />
        <Text style={[typography.button, { color: colors.accent }]}>Volver</Text>
      </Pressable>

      <AsyncContent cargando={cargando} error={error} onReintentar={recargar} vacio={!pedido}>
        {pedido ? (
          <>
            <Card style={{ marginBottom: spacing.md }}>
              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.small, { color: colors.textSecondary }]}>Capturado</Text>
                  <Text style={[typography.h3, { color: colors.text }]}>
                    {hora(pedido.fecha_creacion)}
                  </Text>
                </View>
                <Badge label={etiquetaEstado(pedido.estado)} tone={tonoEstado(pedido.estado)} />
              </View>
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                Mesero: {pedido.usuario_nombre || 'Sin asignar'}
              </Text>
            </Card>

            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>Cuenta</Text>
            <Card style={{ marginBottom: spacing.md }}>
              {pedido.detalles.map((d, i) => (
                <View
                  key={d.id_detalle}
                  style={[
                    styles.itemRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider },
                  ]}
                >
                  <Text style={[typography.body, { color: colors.text, flex: 1 }]}>
                    {d.cantidad}x {d.producto_nombre}
                  </Text>
                  <Text style={[typography.body, { color: colors.textSecondary }]}>
                    {moneda(d.subtotal)}
                  </Text>
                </View>
              ))}
              <View style={[styles.itemRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>Total</Text>
                <Text style={[typography.h3, { color: colors.text }]}>{moneda(total)}</Text>
              </View>
            </Card>

            {esPorValidar ? (
              <>
                <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                  Al inyectar, cocina recibe el pedido y se descuentan los ingredientes segun la
                  receta de cada producto.
                </Text>
                <Button
                  title="Validar e inyectar a cocina"
                  icon={ChefHat}
                  onPress={inyectar}
                  loading={procesando}
                  disabled={procesando}
                />
              </>
            ) : (
              <>
                <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
                  Metodo de pago
                </Text>
                <View style={[styles.metodos, { marginBottom: spacing.md }]}>
                  {METODOS.map((m) => {
                    const activo = metodo === m.value;
                    const Icono = m.icono;
                    return (
                      <Pressable
                        key={m.value}
                        onPress={() => setMetodo(m.value)}
                        style={[
                          styles.metodo,
                          {
                            borderRadius: radius.md,
                            backgroundColor: activo ? `${colors.accent}1F` : colors.surface,
                            borderColor: activo ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Icono size={20} color={activo ? colors.accent : colors.textSecondary} />
                        <Text
                          style={[
                            typography.small,
                            { color: activo ? colors.accent : colors.textSecondary, marginTop: 4 },
                          ]}
                        >
                          {m.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {metodo === 'efectivo' ? (
                  <>
                    <TextField
                      label="Monto recibido"
                      placeholder="0.00"
                      value={recibido}
                      onChangeText={(v) => {
                        setRecibido(v);
                        setErrorRecibido('');
                      }}
                      error={errorRecibido}
                      keyboardType="numeric"
                    />
                    <Card style={{ marginBottom: spacing.md }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[typography.body, { color: colors.textSecondary }]}>Cambio</Text>
                        <Text style={[typography.h3, { color: colors.success }]}>{moneda(cambio)}</Text>
                      </View>
                    </Card>
                  </>
                ) : null}

                <Button
                  title={`Cobrar ${moneda(total)}`}
                  onPress={cobrar}
                  loading={procesando}
                  disabled={procesando}
                />
              </>
            )}
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
  metodos: { flexDirection: 'row', gap: 8 },
  metodo: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
  },
});
