import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Wallet, ReceiptText, Calculator, Settings } from 'lucide-react-native';
import { useAppTheme } from '../theme/ThemeContext';
import CobrarScreen from '../screens/Caja/CobrarScreen';
import DetalleCobroScreen from '../screens/Caja/DetalleCobroScreen';
import TicketEmitidoScreen from '../screens/Caja/TicketEmitidoScreen';
import TicketsScreen from '../screens/Caja/TicketsScreen';
import CorteScreen from '../screens/Caja/CorteScreen';
import GastosScreen from '../screens/Caja/GastosScreen';
import SuministrosScreen from '../screens/Caja/SuministrosScreen';
import ResumenCaja from '../screens/Caja/ResumenCaja';
import NotificacionesScreen from '../screens/shared/NotificacionesScreen';
import AjustesScreen from '../screens/shared/AjustesScreen';
import { opcionesDeTabs, opcionesDeStack, desmontarAlSalir } from './tabOptions';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONOS = {
  Caja: Wallet,
  Tickets: ReceiptText,
  Corte: Calculator,
  Ajustes: Settings,
};

function CobrosStack() {
  return (
    <Stack.Navigator screenOptions={opcionesDeStack}>
      <Stack.Screen name="ListaCobros" component={CobrarScreen} />
      <Stack.Screen name="DetalleCobro" component={DetalleCobroScreen} />
      <Stack.Screen name="TicketEmitido" component={TicketEmitidoScreen} />
      <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
    </Stack.Navigator>
  );
}

// Gastos y suministros cuelgan del corte: son los movimientos que lo afectan.
function CorteStack() {
  return (
    <Stack.Navigator screenOptions={opcionesDeStack}>
      <Stack.Screen name="ResumenCorte" component={CorteScreen} />
      <Stack.Screen name="Gastos" component={GastosScreen} />
      <Stack.Screen name="Suministros" component={SuministrosScreen} />
    </Stack.Navigator>
  );
}

const CajaTab = desmontarAlSalir(CobrosStack);
const TicketsTab = desmontarAlSalir(TicketsScreen);
const CorteTab = desmontarAlSalir(CorteStack);
const AjustesTab = desmontarAlSalir(() => <AjustesScreen PanelResumen={ResumenCaja} />);

export default function CajaNavigator() {
  const { colors, typography } = useAppTheme();

  return (
    <Tab.Navigator screenOptions={opcionesDeTabs({ colors, typography, iconos: ICONOS })}>
      <Tab.Screen name="Caja" component={CajaTab} />
      <Tab.Screen name="Tickets" component={TicketsTab} />
      <Tab.Screen name="Corte" component={CorteTab} />
      <Tab.Screen name="Ajustes" component={AjustesTab} />
    </Tab.Navigator>
  );
}
