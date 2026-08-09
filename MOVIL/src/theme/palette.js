// Identidad de CoffeeFlow: navy #0A1931 como color de marca y dorado #9A7B1C como
// acento. El tema claro parte de un fondo hueso; el oscuro recalibra los mismos tonos
// (el dorado se aclara, el navy pasa a ser fondo) en lugar de reutilizarlos tal cual,
// que era justo el problema del modo oscuro anterior: texto cafe sobre fondo oscuro.
export const light = {
  background: '#F5F2EB',
  surface: '#FFFFFF',
  surfaceAlt: '#EDE7DC',
  primary: '#0A1931',
  primaryDark: '#050D1C',
  accent: '#8A6D14',
  text: '#0A1931',
  textSecondary: '#556375',
  textOnPrimary: '#FFFFFF',
  border: '#DFD7C7',
  divider: '#EAE3D6',
  success: '#2E8F63',
  danger: '#C43B45',
  warning: '#B36B1F',
  disabled: '#B9B2A5',
  overlay: 'rgba(10, 25, 49, 0.5)',
};

export const dark = {
  background: '#0A1931',
  surface: '#152442',
  surfaceAlt: '#1E3055',
  primary: '#1E3055',
  primaryDark: '#152442',
  accent: '#D9B451',
  text: '#F0EDE5',
  textSecondary: '#A8B4C6',
  textOnPrimary: '#FFFFFF',
  border: '#2A3D64',
  divider: '#233458',
  success: '#4CB782',
  danger: '#E5636B',
  warning: '#F2B84B',
  disabled: '#3D4E73',
  overlay: 'rgba(3, 8, 18, 0.7)',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

// Poppins se carga con @expo-google-fonts/poppins en App.js.
export const typography = {
  h1: { fontFamily: 'Poppins_700Bold', fontSize: 26 },
  h2: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  h3: { fontFamily: 'Poppins_700Bold', fontSize: 17 },
  button: { fontFamily: 'Poppins_500Medium', fontSize: 15 },
  body: { fontFamily: 'Poppins_400Regular', fontSize: 15 },
  small: { fontFamily: 'Poppins_400Regular', fontSize: 13 },
  tiny: { fontFamily: 'Poppins_300Light', fontSize: 11 },
};
