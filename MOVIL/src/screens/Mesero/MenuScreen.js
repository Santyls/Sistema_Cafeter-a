import { memo, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, Coffee, Plus, ShoppingCart } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { catalogoApi } from '../../api/catalogoApi';
import { useCarrito } from '../../context/CarritoContext';
import useCarga from '../../hooks/useCarga';
import { moneda } from '../../utils/format';
import { confirmar as confirmarAccion, mostrarMensaje } from '../../utils/alerts';
import PantallaLista from '../../components/common/PantallaLista';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SelectorCantidad from '../../components/common/SelectorCantidad';
import TextField from '../../components/common/TextField';
import FilterTabs from '../../components/common/FilterTabs';
import FloatingModal from '../../components/common/FloatingModal';

/**
 * Fila del menu. Va memoizada porque el buscador cambia de estado en cada tecla: sin
 * esto, escribir "cafe" redibujaba las 132 tarjetas cuatro veces seguidas.
 */
const FilaProducto = memo(function FilaProducto({ producto, onPress }) {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <Pressable onPress={() => onPress(producto)}>
      <Card style={{ marginBottom: spacing.md }}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h3, { color: colors.text }]}>{producto.nombre}</Text>
            {producto.descripcion ? (
              <Text
                style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}
                numberOfLines={2}
              >
                {producto.descripcion}
              </Text>
            ) : null}
          </View>
          <Text style={[typography.h3, { color: colors.accent, marginLeft: 12 }]}>
            {moneda(producto.precio)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
});

export default function MenuScreen({ route, navigation }) {
  const { claveCarrito, titulo } = route.params;
  const { colors, spacing, typography } = useAppTheme();
  const { agregar, piezasDe, totalDe } = useCarrito();

  const [categoria, setCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [nota, setNota] = useState('');
  const [cantidad, setCantidad] = useState(1);

  const cargarTodo = useCallback(async () => {
    const [productos, categorias] = await Promise.all([
      catalogoApi.productos(),
      catalogoApi.categorias(),
    ]);
    return { productos, categorias };
  }, []);

  const { datos, cargando, error, recargar } = useCarga(cargarTodo, null, []);

  const opciones = useMemo(
    () => [
      { value: 'todas', label: 'Todas' },
      ...(datos?.categorias || []).map((c) => ({
        value: String(c.id_categoria),
        label: c.nombre,
      })),
    ],
    [datos]
  );

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return (datos?.productos || [])
      .filter((p) => p.disponible !== false)
      .filter((p) => categoria === 'todas' || String(p.id_categoria) === categoria)
      .filter((p) => !texto || p.nombre.toLowerCase().includes(texto));
  }, [datos, categoria, busqueda]);

  const piezas = piezasDe(claveCarrito);

  const abrir = (producto) => {
    setSeleccionado(producto);
    setNota('');
    setCantidad(1);
  };

  // Se confirma antes de agregar y se avisa despues, pero la pantalla se queda en la
  // lista: casi siempre hay que capturar varios productos seguidos.
  const pedirConfirmacion = () => {
    const producto = seleccionado;
    const cant = cantidad;
    const observaciones = nota.trim();

    confirmarAccion(
      'Agregar al pedido',
      `${cant}x ${producto.nombre} por ${moneda(Number(producto.precio) * cant)}${
        observaciones ? `\nNota: ${observaciones}` : ''
      }`,
      () => {
        agregar(claveCarrito, producto, cant, observaciones);
        setSeleccionado(null);
        mostrarMensaje('Producto agregado', `${cant}x ${producto.nombre} se agrego al pedido.`);
      },
      'Agregar'
    );
  };

  const encabezado = (
    <>
      <Pressable onPress={() => navigation.goBack()} style={[styles.volver, { marginBottom: spacing.md }]}>
        <ChevronLeft size={18} color={colors.accent} />
        <Text style={[typography.button, { color: colors.accent }]}>Volver al pedido</Text>
      </Pressable>

      <TextField placeholder="Buscar producto..." value={busqueda} onChangeText={setBusqueda} />

      <View style={{ marginBottom: spacing.sm }}>
        <FilterTabs options={opciones} value={categoria} onChange={setCategoria} />
      </View>
    </>
  );

  return (
    <PantallaLista
      title={titulo}
      subtitle="Elige los productos del pedido"
      datos={filtrados}
      keyExtractor={(p) => String(p.id_producto)}
      renderItem={({ item }) => <FilaProducto producto={item} onPress={abrir} />}
      encabezado={encabezado}
      cargando={cargando}
      error={error}
      onReintentar={recargar}
      onRefresh={recargar}
      emptyIcon={Coffee}
      emptyTitle="Sin productos"
      emptySubtitle="Prueba con otra categoría o cambia la busqueda."
      pie={
        piezas > 0 ? (
          <Button
            title={`Ver pedido · ${piezas} ${piezas === 1 ? 'producto' : 'productos'} · ${moneda(
              totalDe(claveCarrito)
            )}`}
            icon={ShoppingCart}
            onPress={() => navigation.goBack()}
          />
        ) : null
      }
    >
      <FloatingModal
        visible={!!seleccionado}
        onClose={() => setSeleccionado(null)}
        title={seleccionado?.nombre}
        scroll={false}
      >
        {seleccionado ? (
          <>
            <Text style={[typography.h2, { color: colors.accent, marginBottom: spacing.md }]}>
              {moneda(seleccionado.precio)}
            </Text>

            <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
              Cantidad
            </Text>
            <View style={[styles.cantidadRow, { marginBottom: spacing.md }]}>
              <SelectorCantidad cantidad={cantidad} onCambiar={setCantidad} />
            </View>

            <TextField
              label="Nota para cocina (opcional)"
              placeholder="Sin azucar, leche deslactosada..."
              value={nota}
              onChangeText={setNota}
              multiline
            />

            <Button
              title={`Agregar ${moneda(Number(seleccionado.precio) * cantidad)}`}
              icon={Plus}
              onPress={pedirConfirmacion}
            />
          </>
        ) : null}
      </FloatingModal>
    </PantallaLista>
  );
}

const styles = StyleSheet.create({
  volver: { flexDirection: 'row', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cantidadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
