import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { ChefHat, Timer } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { pedidosApi } from '../../api/pedidosApi';
import useCarga from '../../hooks/useCarga';
import { hoyISO, moneda } from '../../utils/format';
import Card from '../../components/common/Card';
import StatBox from '../../components/common/StatBox';

/** Produccion real del cocinero en el dia, calculada de los pedidos de la API. */
export default function ResumenCocina() {
  const { colors, spacing, typography } = useAppTheme();
  const { datos: pedidos } = useCarga(pedidosApi.listar, []);

  const { preparados, valor, promedio } = useMemo(() => {
    const hoy = hoyISO();
    const delDia = (pedidos || []).filter((p) => {
      if (!p.fecha_creacion) return false;
      const fecha = new Date(p.fecha_creacion).toLocaleDateString('sv-SE');
      return fecha === hoy && ['listo', 'entregado', 'entregado_pagado'].includes(p.estado);
    });

    const total = delDia.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

    return {
      preparados: delDia.length,
      valor: total,
      promedio: delDia.length ? total / delDia.length : 0,
    };
  }, [pedidos]);

  return (
    <>
      <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
        Produccion de hoy
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        <StatBox icon={ChefHat} value={preparados} label="Pedidos preparados" />
        <StatBox icon={Timer} value={moneda(promedio)} label="Ticket promedio" />
      </View>
      <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[typography.small, { color: colors.textSecondary }]}>Valor de lo preparado</Text>
          <Text style={[typography.button, { color: colors.text }]}>{moneda(valor)}</Text>
        </View>
      </Card>
    </>
  );
}
