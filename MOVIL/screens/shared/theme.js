export default function getTheme(darkMode) {
  return {
    bg: darkMode ? '#121212' : '#f7f7f9',
    cardBg: darkMode ? '#1E1E1E' : '#ffffff',
    textMain: darkMode ? '#ffffff' : '#2D1E16',
    textMuted: darkMode ? '#a1a1a5' : '#8E8E93',
    border: darkMode ? 'rgba(255,255,255,0.08)' : '#f2f2f7',
    borderStrong: darkMode ? 'rgba(255,255,255,0.14)' : '#e5e5ea',
    inputBg: darkMode ? '#2A2A2A' : '#ffffff',
  };
}
