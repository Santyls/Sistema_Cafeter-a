import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Mail, ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cajaApi } from '../../api/cajaApi';
import { ApiError } from '../../api/httpClient';
import { moneda, fechaCorta, hora } from '../../utils/format';
import { isValidEmail } from '../../utils/validators';
import { mostrarMensaje } from '../../utils/alerts';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TextField from '../../components/common/TextField';

const NOMBRE_METODO = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

export default function TicketEmitidoScreen({ route, navigation }) {
  const { folio, idTicket, total, metodo, cambio, mesa, detalles } = route.params;
  const { colors, spacing, typography } = useAppTheme();
  const { user } = useAuth();

  const [correo, setCorreo] = useState('');
  const [errorCorreo, setErrorCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const ahora = new Date();

  const enviarPorCorreo = async () => {
    if (!isValidEmail(correo)) {
      setErrorCorreo('Ingresa un correo electrónico válido.');
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await cajaApi.enviarTicketPorCorreo(idTicket, correo.trim());
      setCorreo('');
      mostrarMensaje('Comprobante', respuesta?.message || 'Ticket enviado.');
    } catch (e) {
      mostrarMensaje(
        'No se pudo enviar',
        e instanceof ApiError ? e.message : 'Intenta de nuevo mas tarde.'
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScreenContainer title="Cobro realizado" subtitle={`Folio ${folio}`}>
      <View style={[styles.exito, { marginBottom: spacing.lg }]}>
        <CheckCircle2 size={56} color={colors.success} />
        <Text style={[typography.h1, { color: colors.text, marginTop: spacing.sm }]}>
          {moneda(total)}
        </Text>
        <Text style={[typography.small, { color: colors.textSecondary }]}>
          Pagado con {NOMBRE_METODO[metodo] || metodo}
        </Text>
        {metodo === 'efectivo' && cambio > 0 ? (
          <Text style={[typography.h3, { color: colors.success, marginTop: spacing.xs }]}>
            Cambio: {moneda(cambio)}
          </Text>
        ) : null}
      </View>

      <Card style={{ marginBottom: spacing.md }}>
        <Dato label="Folio" valor={folio} />
        <Dato label="Origen" valor={mesa ? `Mesa ${mesa}` : 'Para llevar'} />
        <Dato label="Fecha" valor={`${fechaCorta(ahora)} · ${hora(ahora)}`} />
        <Dato
          label="Cajero"
          valor={user ? `${user.nombre} ${user.apellido_paterno || ''}`.trim() : 'Cajero'}
        />
      </Card>

      <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>Consumo</Text>
      <Card style={{ marginBottom: spacing.md }}>
        {(detalles || []).map((d, i) => (
          <View
            key={d.id_detalle}
            style={[
              styles.itemRow,
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider },
            ]}
          >
            <Text style={[typography.body, { color: colors.text, flex: 1 }]}>
              {d.cantidad}x {d.producto_nombre}
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary }]}>{moneda(d.subtotal)}</Text>
          </View>
        ))}
      </Card>

      <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
        Comprobante digital
      </Text>
      <Card style={{ marginBottom: spacing.md }}>
        <TextField
          label="Correo del cliente"
          placeholder="cliente@correo.com"
          value={correo}
          onChangeText={(v) => {
            setCorreo(v);
            setErrorCorreo('');
          }}
          error={errorCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button
          title="Enviar por correo"
          variant="outline"
          icon={Mail}
          onPress={enviarPorCorreo}
          loading={enviando}
          disabled={enviando}
        />
      </Card>

      <Button
        title="Volver a caja"
        icon={ArrowLeft}
        onPress={() => navigation.navigate('ListaCobros')}
      />
    </ScreenContainer>
  );
}

function Dato({ label, valor }) {
  const { colors, typography } = useAppTheme();
  return (
    <View style={styles.itemRow}>
      <Text style={[typography.small, { color: colors.textSecondary, flex: 1 }]}>{label}</Text>
      <Text style={[typography.body, { color: colors.text }]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  exito: { alignItems: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
