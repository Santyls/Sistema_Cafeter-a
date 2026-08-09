import { useEffect, useState } from 'react';

/**
 * Duracion real del turno, contada desde que el usuario inicio sesion.
 * Devuelve un texto tipo "02:35 hrs" que se refresca cada minuto.
 */
export default function useTurno(inicioTurno) {
  const calcular = () => {
    if (!inicioTurno) return '00:00 hrs';
    const transcurrido = Math.max(0, Date.now() - inicioTurno);
    const horas = Math.floor(transcurrido / 3600000);
    const minutos = Math.floor((transcurrido % 3600000) / 60000);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')} hrs`;
  };

  const [duracion, setDuracion] = useState(calcular);

  useEffect(() => {
    setDuracion(calcular());
    const intervalo = setInterval(() => setDuracion(calcular()), 60000);
    return () => clearInterval(intervalo);
  }, [inicioTurno]);

  return duracion;
}
