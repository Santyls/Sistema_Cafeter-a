import { useCallback, useMemo } from 'react';
import { View, Text } from 'react-native';
import { ClipboardCheck, LayoutGrid } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { pedidosApi } from '../../api/pedidosApi';
import useCarga from '../../hooks/useCarga';
import { moneda, hoyISO } from '../../utils/format';
import Card from '../../components/common/Card';
import StatBox from '../../components/common/StatBox';

/** Trabajo real del mesero en el dia, calculado de sus propios pedidos. */
export default function ResumenMesero() {
  const { colors, spacing, typography } = useAppTheme();
  const { user } = useAuth();

  const cargar = useCallback(() => pedidosApi.listar(), []);
  const { datos: pedidos } = useCarga(cargar, [], []);

  const { atendidos, mesasActivas, vendido } = useMemo(() => {
    const mios = (pedidos || []).filter((p) => p.id_usuario === user?.id_usuario);
    const hoy = hoyISO();

    const delDia = mios.filter((p) => {
      if (!p.fecha_creacion) return false;
      return new Date(p.fecha_creacion).toLocaleDateString('sv-SE') === hoy;
    });

    const activos = mios.filter((p) => !['entregado_pagado', 'cancelado'].includes(p.estado));

    return {
      atendidos: delDia.filter((p) => p.estado !== 'cancelado').length,
      mesasActivas: new Set(activos.map((p) => p.id_mesa)).size,
      vendido: delDia
        .filter((p) => ['entregado', 'entregado_pagado'].includes(p.estado))
        .reduce((acc, p) => acc + (Number(p.total) || 0), 0),
    };
  }, [pedidos, user]);

  return (
    <>
      <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
        Tu jornada de hoy
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        <StatBox icon={ClipboardCheck} value={atendidos} label="Pedidos tomados" />
        <StatBox icon={LayoutGrid} value={mesasActivas} label="Mesas activas" />
      </View>
      <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[typography.small, { color: colors.textSecondary }]}>Vendido y entregado</Text>
          <Text style={[typography.button, { color: colors.text }]}>{moneda(vendido)}</Text>
        </View>
      </Card>
    </>
  );
}
