import { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import AlertProvider from './src/components/common/AlertProvider';
import RootNavigator from './src/navigation/RootNavigator';

function Root() {
  const { isDark } = useAppTheme();

  return (
    <NavigationContainer>
      <AlertProvider>
        <RootNavigator />
      </AlertProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  // Sin las fuentes cargadas los textos saltan de tamano al aparecer Poppins.
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
