import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../api/tokenStorage';
import { ApiError, setSessionExpiredHandler } from '../api/httpClient';
import { isEmpty } from '../utils/validators';
import { mostrarMensaje } from '../utils/alerts';

const AuthContext = createContext(null);

// Cada rol operativo entra a su propio modulo. El rol 'admin' se gestiona
// exclusivamente desde el panel web y no tiene modulo en la app movil.
export const MODULO_POR_ROL = {
  mesero: 'mesero',
  cocinero: 'cocina',
  cajero: 'caja',
};

// Una cuenta sin modulo movil (admin) recibe el mismo mensaje que unas credenciales
// invalidas, para no revelar que la cuenta existe ni cual es su rol.
const MENSAJE_CREDENCIALES = 'Correo o contraseña incorrectos.';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Marca de tiempo del login: es lo que delimita el turno del empleado.
  const [inicioTurno, setInicioTurno] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Sesion persistida: si ya hay un token guardado se restaura sin pedir credenciales,
  // asi recargar la pagina en web no saca al usuario.
  useEffect(() => {
    (async () => {
      const token = await tokenStorage.getToken();
      if (token) {
        try {
          const perfil = await authApi.perfil();
          if (MODULO_POR_ROL[perfil.rol]) {
            setUser(perfil);
            setInicioTurno(Date.now());
          } else {
            await tokenStorage.clearToken();
          }
        } catch {
          await tokenStorage.clearToken();
        }
      }
      setInitializing(false);
    })();
  }, []);

  // httpClient avisa aqui cuando la API responde 401 con un token que ya no sirve.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser((prev) => {
        if (!prev) return prev;
        tokenStorage.clearToken();
        mostrarMensaje('Sesión expirada', 'Por seguridad, vuelve a iniciar sesión.');
        return null;
      });
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const login = useCallback(async (correo, contrasena) => {
    if (isEmpty(correo) || isEmpty(contrasena)) {
      return { success: false, error: 'Ingresa tu correo y contraseña.' };
    }

    try {
      const perfil = await authApi.login(correo.trim().toLowerCase(), contrasena);

      if (!MODULO_POR_ROL[perfil.rol]) {
        await authApi.logout();
        return { success: false, error: MENSAJE_CREDENCIALES };
      }

      setUser(perfil);
      setInicioTurno(Date.now());
      return { success: true };
    } catch (error) {
      // 401 del servidor: no se distingue entre usuario inexistente y contrasena mala.
      if (error instanceof ApiError && error.status === 401) {
        return { success: false, error: MENSAJE_CREDENCIALES };
      }
      return {
        success: false,
        error: error instanceof ApiError ? error.message : 'No fue posible iniciar sesión.',
      };
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setInicioTurno(null);
  }, []);

  // Se llama tras editar el perfil para que el resto de la app (el saludo, las
  // iniciales) refleje el cambio sin reiniciar sesion.
  const refreshUser = useCallback(async () => {
    const perfil = await authApi.perfil();
    setUser(perfil);
    return perfil;
  }, []);

  const value = useMemo(
    () => ({
      user,
      modulo: user ? MODULO_POR_ROL[user.rol] : null,
      inicioTurno,
      isAuthenticated: !!user,
      initializing,
      login,
      logout,
      refreshUser,
    }),
    [user, inicioTurno, initializing, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
}
