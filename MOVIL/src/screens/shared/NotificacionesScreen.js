import { useState } from 'react';
import { View, Text, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { Bell, BellOff, ChevronLeft, CheckCheck } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { notificacionesApi } from '../../api/notificacionesApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { tiempoRelativo } from '../../utils/format';
import { mostrarMensaje } from '../../utils/alerts';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

// La API guarda el tipo de aviso como texto libre; estas son las que genera el backend.
const ETIQUETA_TIPO = {
  pedido_nuevo: 'Nuevo pedido',
  pedido_listo: 'Pedido listo',
  pedido_cancelado: 'Pedido cancelado',
  stock_bajo: 'Inventario',
};

/** Pantalla compartida por los tres roles: cada uno ve solo sus propios avisos. */
export default function NotificacionesScreen({ navigation }) {
  const { colors, spacing, typography } = useAppTheme();
  const [procesando, setProcesando] = useState(false);

  const { datos: notificaciones, cargando, error, recargar } = useCarga(notificacionesApi.listar, []);

  const sinLeer = (notificaciones || []).filter((n) => n.estado !== 'leida');

  const marcarTodas = async () => {
    setProcesando(true);
    try {
      await Promise.all(sinLeer.map((n) => notificacionesApi.marcarLeida(n.id_notificacion)));
      await recargar();
    } catch (e) {
      mostrarMensaje(
        'No se pudo actualizar',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setProcesando(false);
    }
  };

  const abrir = async (notificacion) => {
    if (notificacion.estado !== 'leida') {
      try {
        await notificacionesApi.marcarLeida(notificacion.id_notificacion);
        await recargar();
      } catch {
        // marcar como leida no es critico: si falla, el aviso sigue ahi
      }
    }
  };

  return (
    <ScreenContainer
      title="Notificaciones"
      subtitle={sinLeer.length > 0 ? `${sinLeer.length} sin leer` : 'Todo al dia'}
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <Pressable onPress={() => navigation.goBack()} style={[styles.volver, { marginBottom: spacing.md }]}>
        <ChevronLeft size={18} color={colors.accent} />
        <Text style={[typography.button, { color: colors.accent }]}>Volver</Text>
      </Pressable>

      <AsyncContent
        cargando={cargando && !notificaciones}
        error={error}
        onReintentar={recargar}
        vacio={(notificaciones || []).length === 0}
        emptyIcon={BellOff}
        emptyTitle="Sin notificaciones"
        emptySubtitle="Aqui apareceran los avisos que te manden los demas modulos."
      >
        <>
          {(notificaciones || []).map((n) => {
            const leida = n.estado === 'leida';
            return (
              <Pressable key={n.id_notificacion} onPress={() => abrir(n)}>
                <Card
                  style={[
                    { marginBottom: spacing.md },
                    !leida && { borderLeftWidth: 3, borderLeftColor: colors.accent },
                  ]}
                >
                  <View style={styles.topRow}>
                    <Bell size={14} color={leida ? colors.textSecondary : colors.accent} />
                    <Text
                      style={[
                        typography.small,
                        { color: leida ? colors.textSecondary : colors.accent, marginLeft: 6, flex: 1 },
                      ]}
                    >
                      {ETIQUETA_TIPO[n.tipo] || 'Sistema'}
                    </Text>
                    <Text style={[typography.tiny, { color: colors.textSecondary }]}>
                      {tiempoRelativo(n.fecha_envio)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      typography.body,
                      { color: colors.text, marginTop: 4 },
                      !leida && { fontFamily: typography.h3.fontFamily },
                    ]}
                  >
                    {n.mensaje}
                  </Text>
                </Card>
              </Pressable>
            );
          })}

          {sinLeer.length > 0 ? (
            <Button
              title="Marcar todas como leidas"
              variant="outline"
              icon={CheckCheck}
              onPress={marcarTodas}
              loading={procesando}
              disabled={procesando}
            />
          ) : null}
        </>
      </AsyncContent>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  volver: { flexDirection: 'row', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center' },
});
