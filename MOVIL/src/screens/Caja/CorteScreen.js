import { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { Calculator, TrendingDown, Truck, LockKeyhole } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cajaApi } from '../../api/cajaApi';
import { ApiError } from '../../api/httpClient';
import useCarga from '../../hooks/useCarga';
import { moneda } from '../../utils/format';
import { confirmar, mostrarMensaje } from '../../utils/alerts';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function CorteScreen({ navigation }) {
  const { colors, spacing, typography } = useAppTheme();
  const { user } = useAuth();
  const [procesando, setProcesando] = useState(false);

  const cargarTodo = useCallback(async () => {
    const [cajas, tickets, gastos] = await Promise.all([
      cajaApi.listar({ estado: 'abierto' }),
      cajaApi.tickets({ with_pagos: true }),
      cajaApi.gastos(),
    ]);
    return { cajas, tickets, gastos };
  }, []);

  const { datos, cargando, error, recargar } = useCarga(cargarTodo, null, []);

  const caja = useMemo(
    () => (datos?.cajas || []).find((c) => c.id_usuario === user?.id_usuario) || null,
    [datos, user]
  );

  const resumen = useMemo(() => {
    if (!caja) return null;

    const misTickets = (datos?.tickets || []).filter(
      (t) => t.id_caja === caja.id_caja && t.estado === 'pagado'
    );

    const porMetodo = { efectivo: 0, tarjeta: 0, transferencia: 0 };
    misTickets.forEach((t) => {
      (t.pagos || []).forEach((p) => {
        if (porMetodo[p.tipo_pago] !== undefined) porMetodo[p.tipo_pago] += Number(p.monto) || 0;
      });
    });

    const misGastos = (datos?.gastos || []).filter((g) => g.id_caja === caja.id_caja);
    const totalGastos = misGastos.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
    const totalVentas = porMetodo.efectivo + porMetodo.tarjeta + porMetodo.transferencia;
    const fondo = Number(caja.fondo_inicial) || 0;

    return {
      fondo,
      porMetodo,
      totalVentas,
      totalGastos,
      tickets: misTickets.length,
      // En caja solo queda fisicamente el efectivo: tarjeta y transferencia no pasan
      // por el cajon, por eso no entran en este calculo.
      enCaja: fondo + porMetodo.efectivo - totalGastos,
    };
  }, [datos, caja, user]);

  const cerrarCaja = () => {
    confirmar(
      'Cerrar caja',
      `Se registrara el corte del turno y la caja quedara cerrada. En caja deben quedar ${moneda(
        resumen.enCaja
      )} en efectivo.`,
      async () => {
        setProcesando(true);
        try {
          await cajaApi.crearCorte({ id_caja: caja.id_caja, diferencia: 0 });
          await cajaApi.cerrar(caja.id_caja, resumen.enCaja);
          await recargar();
          mostrarMensaje('Caja cerrada', 'El corte quedo registrado correctamente.');
        } catch (e) {
          mostrarMensaje(
            'No se pudo cerrar',
            e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
          );
        } finally {
          setProcesando(false);
        }
      },
      'Cerrar caja',
      true
    );
  };

  return (
    <ScreenContainer
      title="Corte de caja"
      subtitle={caja ? 'Resumen del turno actual' : 'Sin caja abierta'}
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <AsyncContent
        cargando={cargando && !datos}
        error={error}
        onReintentar={recargar}
        vacio={!caja}
        emptyIcon={Calculator}
        emptyTitle="No tienes una caja abierta"
        emptySubtitle="Abre tu caja desde la pestaña Caja para poder hacer el corte."
      >
        {resumen ? (
          <>
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={[typography.small, { color: colors.textSecondary, textAlign: 'center' }]}>
                Efectivo que debe haber en caja
              </Text>
              <Text style={[typography.h1, { color: colors.text, textAlign: 'center', marginTop: 4 }]}>
                {moneda(resumen.enCaja)}
              </Text>
              <Text style={[typography.tiny, { color: colors.textSecondary, textAlign: 'center' }]}>
                fondo inicial + ventas en efectivo - gastos
              </Text>
            </Card>

            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
              Ventas del turno
            </Text>
            <Card style={{ marginBottom: spacing.md }}>
              <Fila label="Fondo inicial" valor={moneda(resumen.fondo)} />
              <Fila label="Efectivo" valor={moneda(resumen.porMetodo.efectivo)} />
              <Fila label="Tarjeta" valor={moneda(resumen.porMetodo.tarjeta)} />
              <Fila label="Transferencia" valor={moneda(resumen.porMetodo.transferencia)} />
              <Fila label="Gastos" valor={`- ${moneda(resumen.totalGastos)}`} tono="danger" />
              <View style={[styles.fila, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>Total vendido</Text>
                <Text style={[typography.h3, { color: colors.text }]}>{moneda(resumen.totalVentas)}</Text>
              </View>
              <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: 4 }]}>
                {resumen.tickets} {resumen.tickets === 1 ? 'ticket cobrado' : 'tickets cobrados'}
              </Text>
            </Card>

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              <Button
                title="Gastos"
                variant="outline"
                icon={TrendingDown}
                onPress={() => navigation.navigate('Gastos', { idCaja: caja.id_caja })}
                style={{ flex: 1 }}
              />
              <Button
                title="Suministros"
                variant="outline"
                icon={Truck}
                onPress={() => navigation.navigate('Suministros', { idCaja: caja.id_caja })}
                style={{ flex: 1 }}
              />
            </View>

            <Button
              title="Cerrar caja y registrar corte"
              variant="danger"
              icon={LockKeyhole}
              onPress={cerrarCaja}
              loading={procesando}
              disabled={procesando}
            />
          </>
        ) : null}
      </AsyncContent>
    </ScreenContainer>
  );
}

function Fila({ label, valor, tono }) {
  const { colors, typography } = useAppTheme();
  return (
    <View style={styles.fila}>
      <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>{label}</Text>
      <Text style={[typography.body, { color: tono ? colors[tono] : colors.text }]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
