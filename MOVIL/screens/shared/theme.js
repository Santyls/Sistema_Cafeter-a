export default function getTheme(darkMode) {
  return {
    bg: darkMode ? '#050B14' : '#F5F2EB',
    cardBg: darkMode ? 'rgba(10, 25, 49, 0.9)' : '#FCFAF7',
    textMain: darkMode ? '#ECEFF4' : '#0A1931',
    textMuted: darkMode ? '#728196' : '#556375',
    border: darkMode ? 'rgba(154, 123, 28, 0.15)' : 'rgba(154, 123, 28, 0.15)',
    borderStrong: darkMode ? 'rgba(154, 123, 28, 0.25)' : 'rgba(154, 123, 28, 0.25)',
    inputBg: darkMode ? '#0A1931' : '#FFFFFF',
  };
}
