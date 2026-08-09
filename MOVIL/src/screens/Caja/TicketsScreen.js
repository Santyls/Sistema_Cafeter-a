import { useMemo, useState } from 'react';
import { View, Text, RefreshControl, StyleSheet } from 'react-native';
import { ReceiptText, Banknote, CreditCard, Smartphone } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { cajaApi } from '../../api/cajaApi';
import useCarga from '../../hooks/useCarga';
import { moneda, fechaCorta, hora } from '../../utils/format';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import FilterTabs from '../../components/common/FilterTabs';

const RANGOS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'todos', label: 'Todos' },
];

const ICONO_METODO = {
  efectivo: Banknote,
  tarjeta: CreditCard,
  transferencia: Smartphone,
};

const NOMBRE_METODO = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

const cargarTickets = () => cajaApi.tickets({ with_pagos: true });

export default function TicketsScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const [rango, setRango] = useState('hoy');

  const { datos: tickets, cargando, error, recargar } = useCarga(cargarTickets, []);

  const filtrados = useMemo(() => {
    const lista = tickets || [];
    if (rango === 'todos') return lista;

    const limite = new Date();
    if (rango === 'semana') limite.setDate(limite.getDate() - 6);
    const limiteStr = limite.toLocaleDateString('sv-SE');

    return lista.filter((t) => {
      if (!t.fecha) return false;
      // La API devuelve UTC sin sufijo en algunos registros; sin la Z el navegador
      // lo interpreta como hora local y el ticket cae en el dia equivocado.
      const iso = t.fecha.endsWith('Z') || t.fecha.includes('+') ? t.fecha : `${t.fecha}Z`;
      return new Date(iso).toLocaleDateString('sv-SE') >= limiteStr;
    });
  }, [tickets, rango]);

  const total = useMemo(
    () => filtrados.filter((t) => t.estado === 'pagado').reduce((acc, t) => acc + (Number(t.total) || 0), 0),
    [filtrados]
  );

  return (
    <ScreenContainer
      title="Tickets"
      subtitle={`${filtrados.length} emitidos · ${moneda(total)} cobrado`}
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <View style={{ marginBottom: spacing.sm }}>
        <FilterTabs options={RANGOS} value={rango} onChange={setRango} />
      </View>

      <AsyncContent
        cargando={cargando && !tickets}
        error={error}
        onReintentar={recargar}
        vacio={filtrados.length === 0}
        emptyIcon={ReceiptText}
        emptyTitle="Sin tickets en este rango"
        emptySubtitle="Los cobros que registres apareceran aqui."
      >
        {filtrados.map((ticket) => {
          const tipo = ticket.pagos?.[0]?.tipo_pago;
          const Icono = ICONO_METODO[tipo] || ReceiptText;
          const iso =
            ticket.fecha && !ticket.fecha.endsWith('Z') && !ticket.fecha.includes('+')
              ? `${ticket.fecha}Z`
              : ticket.fecha;

          return (
            <Card key={ticket.id_ticket} style={{ marginBottom: spacing.md }}>
              <View style={styles.topRow}>
                <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>{ticket.folio}</Text>
                <Badge
                  label={ticket.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                  tone={ticket.estado === 'pagado' ? 'success' : 'warning'}
                  soft
                />
              </View>
              <View style={styles.metaRow}>
                <Icono size={14} color={colors.textSecondary} />
                <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 4, flex: 1 }]}>
                  {NOMBRE_METODO[tipo] || 'Sin registrar'} · {fechaCorta(iso)} {hora(iso)}
                </Text>
                <Text style={[typography.button, { color: colors.text }]}>{moneda(ticket.total)}</Text>
              </View>
            </Card>
          );
        })}
      </AsyncContent>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
});
