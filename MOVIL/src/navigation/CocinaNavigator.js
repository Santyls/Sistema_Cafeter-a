import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClipboardList, Package, History, Settings } from 'lucide-react-native';
import { useAppTheme } from '../theme/ThemeContext';
import PedidosScreen from '../screens/Cocina/PedidosScreen';
import DetallePedidoScreen from '../screens/Cocina/DetallePedidoScreen';
import InventarioScreen from '../screens/Cocina/InventarioScreen';
import HistorialScreen from '../screens/Cocina/HistorialScreen';
import ResumenCocina from '../screens/Cocina/ResumenCocina';
import NotificacionesScreen from '../screens/shared/NotificacionesScreen';
import AjustesScreen from '../screens/shared/AjustesScreen';
import { opcionesDeTabs, opcionesDeStack, desmontarAlSalir } from './tabOptions';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONOS = {
  Pedidos: ClipboardList,
  Inventario: Package,
  Historial: History,
  Ajustes: Settings,
};

// El detalle y las notificaciones se abren encima de la lista, no como tab: son
// pantallas de las que se vuelve, no destinos permanentes.
function PedidosStack() {
  return (
    <Stack.Navigator screenOptions={opcionesDeStack}>
      <Stack.Screen name="ListaPedidos" component={PedidosScreen} />
      <Stack.Screen name="DetallePedido" component={DetallePedidoScreen} />
      <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
    </Stack.Navigator>
  );
}

function HistorialStack() {
  return (
    <Stack.Navigator screenOptions={opcionesDeStack}>
      <Stack.Screen name="ListaHistorial" component={HistorialScreen} />
      <Stack.Screen name="DetallePedido" component={DetallePedidoScreen} />
    </Stack.Navigator>
  );
}

const PedidosTab = desmontarAlSalir(PedidosStack);
const InventarioTab = desmontarAlSalir(InventarioScreen);
const HistorialTab = desmontarAlSalir(HistorialStack);
const AjustesTab = desmontarAlSalir(() => <AjustesScreen PanelResumen={ResumenCocina} />);

export default function CocinaNavigator() {
  const { colors, typography } = useAppTheme();

  return (
    <Tab.Navigator screenOptions={opcionesDeTabs({ colors, typography, iconos: ICONOS })}>
      <Tab.Screen name="Pedidos" component={PedidosTab} />
      <Tab.Screen name="Inventario" component={InventarioTab} />
      <Tab.Screen name="Historial" component={HistorialTab} />
      <Tab.Screen name="Ajustes" component={AjustesTab} />
    </Tab.Navigator>
  );
}
