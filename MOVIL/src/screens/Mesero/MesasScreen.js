import { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { LayoutGrid, Bell, Users, Plus } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { catalogoApi } from '../../api/catalogoApi';
import { pedidosApi } from '../../api/pedidosApi';
import useCarga from '../../hooks/useCarga';
import { moneda } from '../../utils/format';
import ScreenContainer from '../../components/common/ScreenContainer';
import AsyncContent from '../../components/common/AsyncContent';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FilterTabs from '../../components/common/FilterTabs';

// Los estados son los que guarda la API (ver ESTADOS_MESA en models/mesa.py).
const ESTADO_MESA = {
  disponible: { label: 'Disponible', tone: 'success' },
  ocupada: { label: 'Ocupada', tone: 'warning' },
  reservada: { label: 'Reservada', tone: 'accent' },
};

const FILTROS = [
  { value: 'todas', label: 'Todas' },
  { value: 'disponible', label: 'Disponibles' },
  { value: 'ocupada', label: 'Ocupadas' },
];

export default function MesasScreen({ navigation }) {
  const { colors, spacing, typography } = useAppTheme();
  const [filtro, setFiltro] = useState('todas');

  const cargarTodo = useCallback(async () => {
    const [mesas, pedidos] = await Promise.all([catalogoApi.mesas(), pedidosApi.listar()]);
    return { mesas, pedidos };
  }, []);

  const { datos, cargando, error, recargar } = useCarga(cargarTodo, null, []);

  // Cuenta acumulada por mesa: solo los pedidos que siguen vivos.
  const cuentaPorMesa = useMemo(() => {
    const acumulado = {};
    (datos?.pedidos || [])
      .filter((p) => !['entregado_pagado', 'cancelado'].includes(p.estado))
      .forEach((p) => {
        acumulado[p.id_mesa] = (acumulado[p.id_mesa] || 0) + (Number(p.total) || 0);
      });
    return acumulado;
  }, [datos]);

  const mesas = datos?.mesas || [];

  const filtradas = useMemo(() => {
    if (filtro === 'todas') return mesas;
    if (filtro === 'disponible') return mesas.filter((m) => m.estado === 'disponible');
    return mesas.filter((m) => m.estado !== 'disponible');
  }, [mesas, filtro]);

  const opciones = FILTROS.map((f) => ({
    ...f,
    count:
      f.value === 'todas'
        ? mesas.length
        : f.value === 'disponible'
        ? mesas.filter((m) => m.estado === 'disponible').length
        : mesas.filter((m) => m.estado !== 'disponible').length,
  }));

  return (
    <ScreenContainer
      title="Mesas"
      subtitle="Toca una mesa para tomar su pedido"
      headerRight={
        <Pressable onPress={() => navigation.navigate('Notificaciones')} hitSlop={8}>
          <Bell size={22} color={colors.text} />
        </Pressable>
      }
      refreshControl={
        <RefreshControl refreshing={cargando} onRefresh={recargar} tintColor={colors.accent} colors={[colors.accent]} />
      }
    >
      <View style={{ marginBottom: spacing.md }}>
        <Button
          title="Crear pedido"
          icon={Plus}
          onPress={() => navigation.navigate('NuevoPedido', {})}
        />
      </View>

      <View style={{ marginBottom: spacing.sm }}>
        <FilterTabs options={opciones} value={filtro} onChange={setFiltro} />
      </View>

      <AsyncContent
        cargando={cargando && !datos}
        error={error}
        onReintentar={recargar}
        vacio={filtradas.length === 0}
        emptyIcon={LayoutGrid}
        emptyTitle="Sin mesas que mostrar"
        emptySubtitle="No hay mesas con ese filtro."
      >
        <View style={styles.grid}>
          {filtradas.map((mesa) => {
            // Un estado desconocido se muestra tal cual, nunca como "disponible":
            // decir que una mesa esta libre cuando no se sabe manda al mesero a una
            // mesa ocupada.
            const estado = ESTADO_MESA[mesa.estado] || { label: mesa.estado, tone: 'textSecondary' };
            const cuenta = cuentaPorMesa[mesa.id_mesa] || 0;

            return (
              <Pressable
                key={mesa.id_mesa}
                style={styles.celda}
                onPress={() =>
                  navigation.navigate('NuevoPedido', {
                    idMesa: mesa.id_mesa,
                    numeroMesa: mesa.numero_mesa,
                  })
                }
              >
                <Card>
                  <View style={styles.topRow}>
                    <Text style={[typography.h3, { color: colors.text, flex: 1 }]}>
                      Mesa {mesa.numero_mesa}
                    </Text>
                  </View>
                  <View style={{ marginTop: 6 }}>
                    <Badge label={estado.label} tone={estado.tone} soft />
                  </View>
                  <View style={[styles.metaRow, { marginTop: 8 }]}>
                    <Users size={13} color={colors.textSecondary} />
                    <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 4 }]}>
                      {mesa.capacidad} lugares
                    </Text>
                  </View>
                  {cuenta > 0 ? (
                    <Text style={[typography.button, { color: colors.accent, marginTop: 4 }]}>
                      Cuenta: {moneda(cuenta)}
                    </Text>
                  ) : null}
                </Card>
              </Pressable>
            );
          })}
        </View>
      </AsyncContent>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  celda: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
});
