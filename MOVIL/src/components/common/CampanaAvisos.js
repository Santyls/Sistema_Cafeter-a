import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import useAvisosSinLeer from '../../hooks/useAvisosSinLeer';

/**
 * Campana con el numero de avisos sin leer. Va en el encabezado de la pantalla
 * principal de cada rol, que es donde el usuario pasa el turno: sin un indicador ahi,
 * las notificaciones existian pero nadie se enteraba de ellas.
 */
export default function CampanaAvisos({ onPress }) {
  const { colors, typography } = useAppTheme();
  // Solo la pantalla principal de cada rol avisa de los nuevos, para no repetir el
  // mismo mensaje una vez por pantalla montada.
  const { sinLeer } = useAvisosSinLeer({ avisarNuevos: true });

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Bell size={22} color={sinLeer > 0 ? colors.accent : colors.text} />
      {sinLeer > 0 ? (
        <View style={[styles.globo, { backgroundColor: colors.danger, borderColor: colors.background }]}>
          <Text style={[typography.tiny, styles.numero]}>{sinLeer > 9 ? '9+' : sinLeer}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  globo: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  numero: { color: '#ffffff', fontSize: 10, lineHeight: 14 },
});
