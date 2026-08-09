"""Generacion y envio de tickets digitales por correo.

En desarrollo no siempre hay un servidor SMTP disponible; en ese caso el envio se
omite silenciosamente (se registra en consola) para no romper el flujo de cobro.
"""

import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from ..config import settings


def construir_html_ticket(folio: str, mesa, total: float, metodo_pago: str, items: list) -> str:
    fecha = datetime.now().strftime("%d/%m/%Y")
    hora = datetime.now().strftime("%H:%M")

    filas = ""
    for item in items:
        cantidad = getattr(item, "cantidad", 1)
        nombre = getattr(item, "nombre", "Producto")
        precio = getattr(item, "precio", 0.0)
        filas += (
            f"<tr><td style='padding: 8px;'>{cantidad}x {nombre}</td>"
            f"<td style='padding: 8px; text-align: right;'>${(cantidad * precio):.2f}</td></tr>"
        )

    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #F9F8F6; padding: 20px; color: #2D1E16;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; padding: 24px; border: 1px solid #E5E5EA; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2D1E16; margin: 0;">CoffeeFlow</h2>
                <p style="color: #8E8E93; margin: 4px 0 0 0; font-size: 14px;">Comprobante de Pago Digital</p>
            </div>
            <div style="border-top: 1px dashed #E5E5EA; border-bottom: 1px dashed #E5E5EA; padding: 12px 0; margin-bottom: 20px;">
                <table style="width: 100%; font-size: 13px; color: #8E8E93;">
                    <tr><td>Folio:</td><td style="text-align: right; color: #2D1E16; font-weight: bold;">{folio}</td></tr>
                    <tr><td>Mesa:</td><td style="text-align: right; color: #2D1E16;">{mesa}</td></tr>
                    <tr><td>Fecha:</td><td style="text-align: right; color: #2D1E16;">{fecha} {hora}</td></tr>
                    <tr><td>Metodo de Pago:</td><td style="text-align: right; color: #2D1E16;">{metodo_pago}</td></tr>
                </table>
            </div>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="border-bottom: 1px solid #E5E5EA; color: #8E8E93; font-size: 12px; text-transform: uppercase;">
                        <th style="text-align: left; padding: 8px 0;">Producto</th>
                        <th style="text-align: right; padding: 8px 0;">Importe</th>
                    </tr>
                </thead>
                <tbody>{filas}</tbody>
            </table>
            <div style="border-top: 2px solid #2D1E16; padding-top: 12px; display: flex; justify-content: space-between;">
                <span style="font-size: 16px; font-weight: bold;">TOTAL</span>
                <span style="font-size: 20px; font-weight: bold; float: right;">${total:.2f}</span>
            </div>
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #8E8E93; font-style: italic;">
                Gracias por su visita!
            </div>
        </div>
    </body>
    </html>
    """


def enviar_ticket_por_correo(destinatario: str, folio: str, html: str) -> bool:
    """Intenta enviar el ticket. Devuelve True si se entrego a un servidor SMTP."""
    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = f"Ticket de Compra - Folio {folio}"
    mensaje["From"] = settings.TICKET_SENDER_EMAIL
    mensaje["To"] = destinatario
    mensaje.attach(MIMEText(html, "html"))

    for host in (settings.SMTP_HOST, settings.SMTP_HOST_FALLBACK):
        try:
            with smtplib.SMTP(host, settings.SMTP_PORT, timeout=settings.SMTP_TIMEOUT) as servidor:
                servidor.sendmail(settings.TICKET_SENDER_EMAIL, destinatario, mensaje.as_string())
            return True
        except Exception:
            continue

    print(f"[tickets] Sin servidor SMTP disponible; ticket {folio} no enviado a {destinatario}")
    return False
