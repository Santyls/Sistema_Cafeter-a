import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../theme/ThemeContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import MeseroNavigator from './MeseroNavigator';
import CocinaNavigator from './CocinaNavigator';
import CajaNavigator from './CajaNavigator';

const NAVEGADOR_POR_MODULO = {
  mesero: MeseroNavigator,
  cocina: CocinaNavigator,
  caja: CajaNavigator,
};

export default function RootNavigator() {
  const { isAuthenticated, initializing, modulo } = useAuth();
  const { colors } = useAppTheme();

  // Mientras se restaura la sesion guardada no se debe mostrar el login por un instante
  // y saltar luego al modulo: eso se ve como un parpadeo.
  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!isAuthenticated) return <LoginScreen />;

  const Navegador = NAVEGADOR_POR_MODULO[modulo];
  return <Navegador />;
}
