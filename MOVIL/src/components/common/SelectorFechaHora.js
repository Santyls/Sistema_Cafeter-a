import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { CalendarClock, ChevronUp } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Horarios de servicio de la cafeteria, en bloques de 30 minutos. */
const HORA_APERTURA = 8;
const HORA_CIERRE = 21;

function generarDias(cantidad) {
  const hoy = new Date();
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function generarHoras() {
  const horas = [];
  for (let h = HORA_APERTURA; h <= HORA_CIERRE; h += 1) {
    horas.push({ h, m: 0 });
    if (h < HORA_CIERRE) horas.push({ h, m: 30 });
  }
  return horas;
}

/**
 * Selector de fecha y hora sin teclado: se elige de una lista de dias y horarios.
 * Escribir "2026-08-15 14:30" a mano era incomodo y se prestaba a errores de formato.
 *
 * Se despliega en linea y no en un <Modal>, porque se usa dentro del modal de
 * reservaciones y dos modales a la vez rompen la app en Android/iOS.
 */
export default function SelectorFechaHora({ label, value, onChange, error, diasDisponibles = 14 }) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const [abierto, setAbierto] = useState(false);
  const [dia, setDia] = useState(() => {
    const base = value ? new Date(value) : new Date();
    base.setHours(0, 0, 0, 0);
    return base;
  });

  const dias = useMemo(() => generarDias(diasDisponibles), [diasDisponibles]);
  const horas = useMemo(generarHoras, []);
  const ahora = new Date();

  const elegir = (h, m) => {
    const elegida = new Date(dia);
    elegida.setHours(h, m, 0, 0);
    onChange(elegida);
    setAbierto(false);
  };

  const textoValor = value
    ? `${DIAS_SEMANA[value.getDay()]} ${value.getDate()} de ${MESES[value.getMonth()]}, ${String(
        value.getHours()
      ).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
    : 'Selecciona fecha y hora';

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => setAbierto((v) => !v)}
        style={[
          styles.campo,
          {
            borderColor: error ? colors.danger : abierto ? colors.accent : colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Text style={[typography.body, { color: value ? colors.text : colors.textSecondary, flex: 1 }]}>
          {textoValor}
        </Text>
        {abierto ? (
          <ChevronUp size={18} color={colors.accent} />
        ) : (
          <CalendarClock size={18} color={colors.textSecondary} />
        )}
      </Pressable>

      {error ? (
        <Text style={[typography.tiny, { color: colors.danger, marginTop: spacing.xs }]}>{error}</Text>
      ) : null}

      {abierto ? (
        <View
          style={[
            styles.panel,
            {
              borderColor: colors.border,
              borderRadius: radius.md,
              backgroundColor: colors.surface,
              marginTop: spacing.xs,
              padding: spacing.md,
            },
          ]}
        >
        <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          Dia
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {dias.map((d) => {
            const activo = d.toDateString() === dia.toDateString();
            return (
              <Pressable
                key={d.toISOString()}
                onPress={() => setDia(d)}
                style={[
                  styles.dia,
                  {
                    borderRadius: radius.md,
                    backgroundColor: activo ? colors.accent : colors.surfaceAlt,
                    borderColor: activo ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.tiny,
                    { color: activo ? colors.textOnPrimary : colors.textSecondary },
                  ]}
                >
                  {DIAS_SEMANA[d.getDay()]}
                </Text>
                <Text
                  style={[
                    typography.h3,
                    { color: activo ? colors.textOnPrimary : colors.text },
                  ]}
                >
                  {d.getDate()}
                </Text>
                <Text
                  style={[
                    typography.tiny,
                    { color: activo ? colors.textOnPrimary : colors.textSecondary },
                  ]}
                >
                  {MESES[d.getMonth()].slice(0, 3)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          Hora
        </Text>
        <ScrollView style={{ maxHeight: 220 }}>
          <View style={styles.horas}>
            {horas.map(({ h, m }) => {
              const candidata = new Date(dia);
              candidata.setHours(h, m, 0, 0);
              // Una reservacion en el pasado no tiene sentido.
              const pasada = candidata <= ahora;
              const activa =
                value && value.getTime() === candidata.getTime();

              return (
                <Pressable
                  key={`${h}-${m}`}
                  onPress={() => !pasada && elegir(h, m)}
                  disabled={pasada}
                  style={[
                    styles.hora,
                    {
                      borderRadius: radius.sm,
                      backgroundColor: activa ? colors.accent : colors.surfaceAlt,
                      borderColor: activa ? colors.accent : colors.border,
                      opacity: pasada ? 0.35 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.small,
                      { color: activa ? colors.textOnPrimary : colors.text },
                    ]}
                  >
                    {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  panel: { borderWidth: 1 },
  dia: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
  },
  horas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hora: { paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1 },
});
