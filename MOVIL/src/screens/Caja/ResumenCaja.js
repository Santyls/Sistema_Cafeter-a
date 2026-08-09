import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Receipt, Banknote } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { cajaApi } from '../../api/cajaApi';
import useCarga from '../../hooks/useCarga';
import { moneda, hoyISO } from '../../utils/format';
import Card from '../../components/common/Card';
import StatBox from '../../components/common/StatBox';

const cargarTickets = () => cajaApi.tickets({ with_pagos: true });

const NOMBRE_METODO = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

/** Cobros reales del dia, tomados de los tickets pagados que guarda la API. */
export default function ResumenCaja() {
  const { colors, spacing, typography } = useAppTheme();
  const { datos: tickets } = useCarga(cargarTickets, []);

  const { cobrados, total, porMetodo } = useMemo(() => {
    const hoy = hoyISO();
    const delDia = (tickets || []).filter((t) => {
      if (t.estado !== 'pagado' || !t.fecha) return false;
      const iso = t.fecha.endsWith('Z') || t.fecha.includes('+') ? t.fecha : `${t.fecha}Z`;
      return new Date(iso).toLocaleDateString('sv-SE') === hoy;
    });

    const suma = delDia.reduce((acc, t) => acc + (Number(t.total) || 0), 0);

    const agrupado = delDia.reduce((acc, t) => {
      const tipo = t.pagos?.[0]?.tipo_pago;
      const nombre = NOMBRE_METODO[tipo] || 'Sin registrar';
      acc[nombre] = (acc[nombre] || 0) + (Number(t.total) || 0);
      return acc;
    }, {});

    return { cobrados: delDia.length, total: suma, porMetodo: Object.entries(agrupado) };
  }, [tickets]);

  return (
    <>
      <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
        Cobros de hoy
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        <StatBox icon={Receipt} value={cobrados} label="Tickets cobrados" />
        <StatBox icon={Banknote} value={moneda(total)} label="Total cobrado" />
      </View>

      {porMetodo.length > 0 ? (
        <Card style={{ marginBottom: spacing.md }}>
          {porMetodo.map(([metodo, monto]) => (
            <View
              key={metodo}
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}
            >
              <Text style={[typography.small, { color: colors.textSecondary }]}>{metodo}</Text>
              <Text style={[typography.button, { color: colors.text }]}>{moneda(monto)}</Text>
            </View>
          ))}
        </Card>
      ) : null}
    </>
  );
}
