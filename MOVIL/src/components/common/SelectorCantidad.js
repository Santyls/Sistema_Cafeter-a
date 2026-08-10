import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

/**
 * Selector de cantidad.
 *
 * Antes se armaba con dos Button de ancho fijo 48 y titulo "+" / "-". Como Button trae
 * 24px de padding horizontal por lado, al texto no le quedaba ni un pixel y los signos
 * salian recortados: se veian dos botones vacios. Aqui los signos son iconos y el
 * tamano se define de una vez.
 */
export default function SelectorCantidad({ cantidad, onCambiar, minimo = 1 }) {
  const { colors, radius, typography } = useAppTheme();

  const boton = (Icono, alPresionar, deshabilitado) => (
    <Pressable
      onPress={alPresionar}
      disabled={deshabilitado}
      style={({ pressed }) => [
        styles.boton,
        {
          borderRadius: radius.md,
          borderColor: deshabilitado ? colors.border : colors.accent,
          backgroundColor: deshabilitado ? colors.surfaceAlt : `${colors.accent}1F`,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Icono size={20} color={deshabilitado ? colors.disabled : colors.accent} strokeWidth={2.5} />
    </Pressable>
  );

  return (
    <View style={styles.fila}>
      {boton(Minus, () => onCambiar(cantidad - 1), cantidad <= minimo)}
      <Text style={[typography.h2, styles.numero, { color: colors.text }]}>{cantidad}</Text>
      {boton(Plus, () => onCambiar(cantidad + 1), false)}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
  boton: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: { minWidth: 48, textAlign: 'center' },
});
