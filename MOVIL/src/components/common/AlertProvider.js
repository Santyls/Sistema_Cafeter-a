import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { registrarManejadorDeAvisos } from '../../utils/alerts';
import FloatingModal from './FloatingModal';
import Button from './Button';

/**
 * Monta el modal unico de avisos y lo registra en utils/alerts, para que
 * mostrarMensaje/confirmar funcionen desde cualquier parte de la app, incluido
 * codigo que no es un componente.
 */
export default function AlertProvider({ children }) {
  const { colors, spacing, typography } = useAppTheme();
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    registrarManejadorDeAvisos(setAviso);
    return () => registrarManejadorDeAvisos(null);
  }, []);

  const cerrar = () => {
    const alCerrar = aviso?.onDismiss;
    setAviso(null);
    alCerrar?.();
  };

  const aceptar = () => {
    const accion = aviso?.onConfirmar;
    setAviso(null);
    accion?.();
  };

  const esConfirmacion = !!aviso?.onConfirmar;

  return (
    <>
      {children}

      <FloatingModal visible={!!aviso} onClose={cerrar} title={aviso?.titulo} scroll={false}>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}>
          {aviso?.mensaje}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
          {esConfirmacion ? (
            <>
              <Button title="Cancelar" variant="outline" onPress={cerrar} style={{ flex: 1 }} />
              <Button
                title={aviso?.textoConfirmar || 'Confirmar'}
                variant={aviso?.destructivo ? 'danger' : 'primary'}
                onPress={aceptar}
                style={{ flex: 1 }}
              />
            </>
          ) : (
            <Button title="Aceptar" onPress={cerrar} style={{ flex: 1 }} />
          )}
        </View>
      </FloatingModal>
    </>
  );
}
