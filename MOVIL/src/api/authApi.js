import { httpClient } from './httpClient';
import { tokenStorage } from './tokenStorage';

export const authApi = {
  async login(usuario, contrasena) {
    const datos = await httpClient.post('/auth/login', { usuario, contrasena }, { auth: false });
    await tokenStorage.setToken(datos.access_token);
    return datos.usuario;
  },

  async logout() {
    await tokenStorage.clearToken();
  },

  perfil: () => httpClient.get('/auth/me'),

  actualizarPerfil: (cambios) => httpClient.put('/auth/me', cambios),
};
