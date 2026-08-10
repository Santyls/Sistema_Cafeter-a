import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutGrid, ClipboardList, CalendarClock, Settings } from 'lucide-react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { CarritoProvider } from '../context/CarritoContext';
import MesasScreen from '../screens/Mesero/MesasScreen';
import NuevoPedidoScreen from '../screens/Mesero/NuevoPedidoScreen';
import MenuScreen from '../screens/Mesero/MenuScreen';
import SeguimientoScreen from '../screens/Mesero/SeguimientoScreen';
import DetalleSeguimientoScreen from '../screens/Mesero/DetalleSeguimientoScreen';
import ReservacionesScreen from '../screens/Mesero/ReservacionesScreen';
import ResumenMesero from '../screens/Mesero/ResumenMesero';
import NotificacionesScreen from '../screens/shared/NotificacionesScreen';
import AjustesScreen from '../screens/shared/AjustesScreen';
import { opcionesDeTabs, opcionesDeStack, desmontarAlSalir } from './tabOptions';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONOS = {
  Mesas: LayoutGrid,
  Pedidos: ClipboardList,
  Reservas: CalendarClock,
  Ajustes: Settings,
};

// Levantar un pedido es un flujo de ida y vuelta (mesas -> nuevo pedido -> menu -> de
// regreso al pedido), por eso va en un stack: se avanza y se regresa sin perder lo
// capturado.
function MesasStack() {
  return (
    <Stack.Navigator screenOptions={opcionesDeStack}>
      <Stack.Screen name="MapaMesas" component={MesasScreen} />
      <Stack.Screen name="NuevoPedido" component={NuevoPedidoScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
    </Stack.Navigator>
  );
}

function PedidosStack() {
  return (
    <Stack.Navigator screenOptions={opcionesDeStack}>
      <Stack.Screen name="ListaSeguimiento" component={SeguimientoScreen} />
      <Stack.Screen name="DetalleSeguimiento" component={DetalleSeguimientoScreen} />
    </Stack.Navigator>
  );
}

const MesasTab = desmontarAlSalir(MesasStack);
const PedidosTab = desmontarAlSalir(PedidosStack);
const ReservasTab = desmontarAlSalir(ReservacionesScreen);
const AjustesTab = desmontarAlSalir(() => <AjustesScreen PanelResumen={ResumenMesero} />);

export default function MeseroNavigator() {
  const { colors, typography } = useAppTheme();

  return (
    <CarritoProvider>
      <Tab.Navigator screenOptions={opcionesDeTabs({ colors, typography, iconos: ICONOS })}>
        <Tab.Screen name="Mesas" component={MesasTab} />
        <Tab.Screen name="Pedidos" component={PedidosTab} />
        <Tab.Screen name="Reservas" component={ReservasTab} />
        <Tab.Screen name="Ajustes" component={AjustesTab} />
      </Tab.Navigator>
    </CarritoProvider>
  );
}
