import { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, LayoutGrid, ShoppingBag, Plus, Send, Trash2, TriangleAlert } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { catalogoApi } from '../../api/catalogoApi';
import { pedidosApi } from '../../api/pedidosApi';
import { ApiError } from '../../api/httpClient';
import { useCarrito } from '../../context/CarritoContext';
import useCarga from '../../hooks/useCarga';
import { moneda } from '../../utils/format';
import { confirmar, mostrarMensaje } from '../../utils/alerts';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SelectorCantidad from '../../components/common/SelectorCantidad';
import TextField from '../../components/common/TextField';
import FloatingModal from '../../components/common/FloatingModal';
import EmptyState from '../../components/common/EmptyState';

/**
 * Preview del pedido: aqui se decide si es de mesa o para llevar, se revisan los
 * productos capturados y se manda a caja. Es el paso donde el mesero confirma con el
 * cliente antes de que el pedido entre al sistema.
 */
export default function NuevoPedidoScreen({ route, navigation }) {
  const { idMesa: idMesaInicial, numeroMesa: numeroMesaInicial } = route.params || {};
  const { colors, radius, spacing, typography } = useAppTheme();
  const { itemsDe, totalDe, cambiarCantidad, vaciar } = useCarrito();

  // Clave del carrito: cada mesa tiene el suyo, y los pedidos para llevar comparten uno.
  const [tipo, setTipo] = useState(idMesaInicial ? 'mesa' : null);
  const [mesa, setMesa] = useState(
    idMesaInicial ? { id_mesa: idMesaInicial, numero_mesa: numeroMesaInicial } : null
  );
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);

  const claveCarrito = tipo === 'para_llevar' ? 'para_llevar' : mesa?.id_mesa;
  const items = claveCarrito ? itemsDe(claveCarrito) : [];
  const total = claveCarrito ? totalDe(claveCarrito) : 0;

  const { datos: mesas, cargando, recargar } = useCarga(catalogoApi.mesas, []);

  const disponibles = useMemo(
    () => (mesas || []).filter((m) => m.estado === 'disponible'),
    [mesas]
  );

  const elegirMesa = () => {
    if (disponibles.length === 0) {
      confirmar(
        'No hay mesas disponibles',
        'Todas las mesas estan ocupadas o reservadas. Preguntale al cliente si prefiere esperar a que se desocupe una, o llevarse su pedido.',
        () => {
          setTipo('para_llevar');
          setMesa(null);
        },
        'Cambiar a para llevar'
      );
      return;
    }
    setSelectorAbierto(true);
  };

  const cancelarPedido = () => {
    confirmar(
      'Cancelar pedido',
      tipo === 'mesa' && mesa
        ? `Se liberara la mesa ${mesa.numero_mesa} y se quitaran los ${items.length} productos capturados.`
        : `Se quitaran los ${items.length} productos capturados.`,
      () => {
        if (claveCarrito) vaciar(claveCarrito);
        navigation.navigate('MapaMesas');
      },
      'Si, cancelar',
      true
    );
  };

  const enviar = () => {
    confirmar(
      'Confirmar pedido',
      `Confirma con el cliente antes de mandarlo: ${items.length} ${
        items.length === 1 ? 'producto' : 'productos'
      } por ${moneda(total)}.`,
      mandarACaja,
      'Confirmar y enviar'
    );
  };

  const mandarACaja = async () => {
    setEnviando(true);
    try {
      // Cortesia antes de prometerle algo al cliente: si a cocina le falta un
      // ingrediente, es mejor saberlo ahora que cuando ya se cobro.
      const revision = await pedidosApi.revisarDisponibilidad(
        items.map((i) => ({ id_producto: i.producto.id_producto, cantidad: i.cantidad }))
      );

      if (!revision.disponible) {
        setEnviando(false);
        const detalle = revision.faltantes
          .map(
            (f) =>
              `${f.productos.join(', ')}: faltan ${f.falta} ${f.unidad} de ${f.ingrediente}`
          )
          .join('\n');
        mostrarMensaje(
          'No se puede preparar todo',
          `${detalle}\n\nQuita esos productos o avisa a cocina para reabastecer.`
        );
        return;
      }

      await pedidosApi.crear({
        tipo_pedido: tipo,
        id_mesa: tipo === 'mesa' ? mesa.id_mesa : null,
        observaciones: observaciones.trim() || null,
        detalles: items.map((i) => ({
          id_producto: i.producto.id_producto,
          cantidad: i.cantidad,
          observaciones: i.observaciones || null,
        })),
      });

      vaciar(claveCarrito);
      setObservaciones('');
      mostrarMensaje(
        'Pedido enviado',
        'Caja lo validara y lo mandara a cocina. Puedes seguirlo desde la pestaña Pedidos.'
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

  const listoParaEnviar = tipo && (tipo === 'para_llevar' || mesa) && items.length > 0;

  return (
    <ScreenContainer title="Nuevo pedido" subtitle="Arma el pedido y confirmalo con el cliente">
      <Pressable onPress={() => navigation.goBack()} style={[styles.volver, { marginBottom: spacing.md }]}>
        <ChevronLeft size={18} color={colors.accent} />
        <Text style={[typography.button, { color: colors.accent }]}>Volver</Text>
      </Pressable>

      <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
        ¿Donde consume el cliente?
      </Text>
      <View style={[styles.opciones, { marginBottom: spacing.md }]}>
        <Pressable
          onPress={elegirMesa}
          style={[
            styles.opcion,
            {
              borderRadius: radius.md,
              backgroundColor: tipo === 'mesa' ? `${colors.accent}1F` : colors.surface,
              borderColor: tipo === 'mesa' ? colors.accent : colors.border,
            },
          ]}
        >
          <LayoutGrid size={22} color={tipo === 'mesa' ? colors.accent : colors.textSecondary} />
          <Text
            style={[
              typography.button,
              { color: tipo === 'mesa' ? colors.accent : colors.textSecondary, marginTop: 6 },
            ]}
          >
            En mesa
          </Text>
          <Text style={[typography.tiny, { color: colors.textSecondary }]}>
            {mesa ? `Mesa ${mesa.numero_mesa}` : `${disponibles.length} disponibles`}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setTipo('para_llevar');
            setMesa(null);
          }}
          style={[
            styles.opcion,
            {
              borderRadius: radius.md,
              backgroundColor: tipo === 'para_llevar' ? `${colors.accent}1F` : colors.surface,
              borderColor: tipo === 'para_llevar' ? colors.accent : colors.border,
            },
          ]}
        >
          <ShoppingBag size={22} color={tipo === 'para_llevar' ? colors.accent : colors.textSecondary} />
          <Text
            style={[
              typography.button,
              { color: tipo === 'para_llevar' ? colors.accent : colors.textSecondary, marginTop: 6 },
            ]}
          >
            Para llevar
          </Text>
          <Text style={[typography.tiny, { color: colors.textSecondary }]}>Sin mesa</Text>
        </Pressable>
      </View>

      {!tipo ? (
        <EmptyState
          icon={TriangleAlert}
          title="Elige primero el tipo de pedido"
          subtitle="Selecciona una mesa o marca el pedido como para llevar."
        />
      ) : (
        <>
          <View style={{ marginBottom: spacing.md }}>
            <Button
              title={items.length === 0 ? 'Agregar productos' : 'Agregar mas productos'}
              variant="outline"
              icon={Plus}
              onPress={() =>
                navigation.navigate('Menu', {
                  claveCarrito,
                  titulo: tipo === 'para_llevar' ? 'Para llevar' : `Mesa ${mesa.numero_mesa}`,
                })
              }
            />
          </View>

          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Todavía no hay productos"
              subtitle="Agrega lo que pidio el cliente para poder enviar el pedido."
            />
          ) : (
            <>
              <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
                Detalle del pedido
              </Text>

              {items.map((item, indice) => (
                <Card key={`${item.producto.id_producto}-${indice}`} style={{ marginBottom: spacing.md }}>
                  <View style={styles.filaTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.h3, { color: colors.text }]}>
                        {item.producto.nombre}
                      </Text>
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

                  <View style={{ marginTop: spacing.sm }}>
                    <SelectorCantidad
                      cantidad={item.cantidad}
                      minimo={0}
                      onCambiar={(n) => cambiarCantidad(claveCarrito, indice, n)}
                    />
                  </View>
                </Card>
              ))}

              <Card style={{ marginBottom: spacing.md }}>
                <View style={styles.filaTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.h2, { color: colors.text }]}>Total</Text>
                    <Badge
                      label={tipo === 'para_llevar' ? 'Para llevar' : `Mesa ${mesa.numero_mesa}`}
                      tone="accent"
                      soft
                    />
                  </View>
                  <Text style={[typography.h1, { color: colors.text }]}>{moneda(total)}</Text>
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
                title="Enviar pedido"
                icon={Send}
                onPress={enviar}
                loading={enviando}
                disabled={enviando || !listoParaEnviar}
              />

              <View style={{ marginTop: spacing.sm }}>
                <Button
                  title="Cancelar pedido"
                  variant="outline"
                  icon={Trash2}
                  onPress={cancelarPedido}
                  disabled={enviando}
                />
              </View>
            </>
          )}
        </>
      )}

      <FloatingModal
        visible={selectorAbierto}
        onClose={() => setSelectorAbierto(false)}
        title="Elige una mesa"
      >
        <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
          Solo aparecen las mesas libres. Una mesa con reservacion en menos de 90 minutos no se
          puede usar.
        </Text>
        {disponibles.map((m) => (
          <Pressable
            key={m.id_mesa}
            onPress={() => {
              setMesa(m);
              setTipo('mesa');
              setSelectorAbierto(false);
            }}
          >
            <Card style={{ marginBottom: spacing.sm }}>
              <View style={styles.filaTop}>
                <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>
                  Mesa {m.numero_mesa}
                </Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  {m.capacidad} lugares
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </FloatingModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  volver: { flexDirection: 'row', alignItems: 'center' },
  opciones: { flexDirection: 'row', gap: 10 },
  opcion: { flex: 1, alignItems: 'center', paddingVertical: 16, borderWidth: 1.5 },
  filaTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cantidadFila: { flexDirection: 'row', alignItems: 'center' },
});
