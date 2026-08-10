import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { PASOS, pasoDeEstado } from '../../constants/pedidos';

/**
 * Barra de avance del pedido. Muestra en que punto va sin tener que abrir el historial:
 * En caja -> En cocina -> Preparando -> Listo -> Entregado.
 */
export default function ProgresoPedido({ estado }) {
  const { colors, typography, spacing } = useAppTheme();

  if (estado === 'cancelado') {
    return (
      <View style={[styles.cancelado, { backgroundColor: `${colors.danger}18`, marginTop: spacing.sm }]}>
        <Text style={[typography.small, { color: colors.danger, textAlign: 'center' }]}>
          Este pedido fue cancelado
        </Text>
      </View>
    );
  }

  const actual = pasoDeEstado(estado);

  return (
    <View style={[styles.wrap, { marginTop: spacing.sm }]}>
      {PASOS.map((paso, i) => {
        const alcanzado = i <= actual;
        const esActual = i === actual;

        return (
          <View key={paso.estado} style={styles.paso}>
            <View style={styles.lineaFila}>
              {/* Los tramos de linea van entre puntos, no en los extremos. */}
              <View
                style={[
                  styles.linea,
                  { backgroundColor: i > 0 && alcanzado ? colors.accent : colors.border },
                  i === 0 && styles.invisible,
                ]}
              />
              <View
                style={[
                  styles.punto,
                  {
                    backgroundColor: alcanzado ? colors.accent : colors.surfaceAlt,
                    borderColor: alcanzado ? colors.accent : colors.border,
                  },
                  esActual && styles.puntoActual,
                ]}
              />
              <View
                style={[
                  styles.linea,
                  { backgroundColor: i < actual ? colors.accent : colors.border },
                  i === PASOS.length - 1 && styles.invisible,
                ]}
              />
            </View>
            <Text
              style={[
                typography.tiny,
                {
                  color: esActual ? colors.accent : alcanzado ? colors.text : colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 4,
                },
                esActual && { fontFamily: typography.button.fontFamily },
              ]}
              numberOfLines={2}
            >
              {paso.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row' },
  paso: { flex: 1 },
  lineaFila: { flexDirection: 'row', alignItems: 'center' },
  linea: { flex: 1, height: 2 },
  invisible: { opacity: 0 },
  punto: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  puntoActual: { width: 18, height: 18, borderRadius: 9 },
});
