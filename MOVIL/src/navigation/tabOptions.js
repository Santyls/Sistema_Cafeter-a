import { useIsFocused } from '@react-navigation/native';

/**
 * Desmonta la pantalla (y cualquier modal que tenga abierto) al cambiar de pestana.
 * Sin esto, un modal abierto en una pestana sigue visible al pasar a otra, y las
 * pantallas guardan estado viejo de la vez anterior.
 */
export function desmontarAlSalir(Componente) {
  return function PantallaConDesmontaje(props) {
    const enfocada = useIsFocused();
    return enfocada ? <Componente {...props} /> : null;
  };
}

/**
 * Opciones compartidas por los tres tab navigators, para que la barra inferior se vea
 * y se comporte igual en Mesero, Cocina y Caja.
 */
export function opcionesDeTabs({ colors, typography, iconos }) {
  return ({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
    },
    tabBarLabelStyle: { fontFamily: typography.button.fontFamily, fontSize: 11 },
    tabBarIcon: ({ color, size, focused }) => {
      const Icono = iconos[route.name];
      return <Icono size={size} color={color} strokeWidth={focused ? 2.4 : 2} />;
    },
  });
}

/** Un stack sin encabezado propio: cada pantalla usa su ScreenContainer. */
export const opcionesDeStack = { headerShown: false };
