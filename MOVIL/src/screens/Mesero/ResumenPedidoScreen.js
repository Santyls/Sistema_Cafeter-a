import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, Send, Trash2, ShoppingCart } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { pedidosApi } from '../../api/pedidosApi';
import { ApiError } from '../../api/httpClient';
import { useCarrito } from '../../context/CarritoContext';
import { moneda } from '../../utils/format';
import { confirmar as confirmarAccion, mostrarMensaje } from '../../utils/alerts';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TextField from '../../components/common/TextField';
import EmptyState from '../../components/common/EmptyState';

export default function ResumenPedidoScreen({ route, navigation }) {
  const { idMesa, numeroMesa } = route.params;
  const { colors, spacing, typography } = useAppTheme();
  const { itemsDe, totalDe, cambiarCantidad, vaciar } = useCarrito();

  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);

  const items = itemsDe(idMesa);
  const total = totalDe(idMesa);

  const enviar = async () => {
    if (items.length === 0) return;

    setEnviando(true);
    try {
      await pedidosApi.crear({
        id_mesa: idMesa,
        observaciones: observaciones.trim() || null,
        detalles: items.map((i) => ({
          id_producto: i.producto.id_producto,
          cantidad: i.cantidad,
          observaciones: i.observaciones || null,
        })),
      });
      vaciar(idMesa);
      setObservaciones('');
      mostrarMensaje(
        'Pedido enviado',
        'Caja lo validara e inyectara a cocina. Puedes seguirlo desde la pestana Pedidos.'
      );
      navigation.navigate('MapaMesas');
    } catch (e) {
      mostrarMensaje(
        'No se pudo enviar',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setEnviando(false);
    }
  };

  const vaciarCarrito = () => {
    confirmarAccion(
      'Vaciar pedido',
      `Se quitaran los ${items.length} productos capturados para la mesa ${numeroMesa}.`,
      () => vaciar(idMesa),
      'Vaciar',
      true
    );
  };

  return (
    <ScreenContainer title={`Pedido mesa ${numeroMesa}`} subtitle="Revisa antes de enviar">
      <Pressable onPress={() => navigation.goBack()} style={[styles.volver, { marginBottom: spacing.md }]}>
        <ChevronLeft size={18} color={colors.accent} />
        <Text style={[typography.button, { color: colors.accent }]}>Seguir agregando</Text>
      </Pressable>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="El pedido esta vacio"
          subtitle="Agrega productos desde el menu para poder enviarlo."
        />
      ) : (
        <>
          {items.map((item, indice) => (
            <Card key={`${item.producto.id_producto}-${indice}`} style={{ marginBottom: spacing.md }}>
              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h3, { color: colors.text }]}>{item.producto.nombre}</Text>
                  <Text style={[typography.small, { color: colors.textSecondary }]}>
                    {moneda(item.producto.precio)} c/u
                  </Text>
                  {item.observaciones ? (
                    <Text style={[typography.small, { color: colors.accent, marginTop: 2 }]}>
                      {item.observaciones}
                    </Text>
                  ) : null}
                </View>
                <Text style={[typography.h3, { color: colors.text }]}>
                  {moneda(Number(item.producto.precio) * item.cantidad)}
                </Text>
              </View>

              <View style={[styles.cantidadRow, { marginTop: spacing.sm }]}>
                <Button
                  title="-"
                  variant="outline"
                  onPress={() => cambiarCantidad(idMesa, indice, item.cantidad - 1)}
                  style={{ width: 48 }}
                />
                <Text style={[typography.h3, { color: colors.text, marginHorizontal: spacing.md }]}>
                  {item.cantidad}
                </Text>
                <Button
                  title="+"
                  variant="outline"
                  onPress={() => cambiarCantidad(idMesa, indice, item.cantidad + 1)}
                  style={{ width: 48 }}
                />
              </View>
            </Card>
          ))}

          <Card style={{ marginBottom: spacing.md }}>
            <View style={styles.topRow}>
              <Text style={[typography.h2, { color: colors.text, flex: 1 }]}>Total</Text>
              <Text style={[typography.h2, { color: colors.text }]}>{moneda(total)}</Text>
            </View>
          </Card>

          <TextField
            label="Nota general del pedido (opcional)"
            placeholder="Servir todo junto, alergia a nueces..."
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
          />

          <Button
            title="Enviar a caja"
            icon={Send}
            onPress={enviar}
            loading={enviando}
            disabled={enviando}
          />

          <View style={{ marginTop: spacing.sm }}>
            <Button title="Vaciar pedido" variant="outline" icon={Trash2} onPress={vaciarCarrito} />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  volver: { flexDirection: 'row', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cantidadRow: { flexDirection: 'row', alignItems: 'center' },
});
