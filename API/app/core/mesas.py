from sqlalchemy.orm import Session

from ..models.caja import Ticket
from ..models.mesa import Mesa
from ..models.pedido import Pedido


def liberar_mesa_si_corresponde(db: Session, pedido: Pedido) -> None:
    """
    Libera la mesa cuando ya no le queda nada por cobrar.

    Una mesa NO se libera al entregar el pedido: el cliente sigue sentado consumiendo.
    Se libera cuando su cuenta queda saldada, es decir cuando todos sus pedidos estan
    pagados o cancelados. Asi una mesa con dos pedidos (el segundo pedido a media
    comida) sigue ocupada hasta que se cobra la cuenta completa.

    Los pedidos para llevar no tocan ninguna mesa.
    """
    if not pedido.id_mesa:
        return

    pagados = db.query(Ticket.id_pedido).filter(Ticket.estado == "pagado").subquery()

    pendientes = (
        db.query(Pedido)
        .filter(
            Pedido.id_mesa == pedido.id_mesa,
            Pedido.estado != "cancelado",
            Pedido.id_pedido.notin_(pagados),
        )
        .count()
    )

    if pendientes == 0:
        mesa = db.get(Mesa, pedido.id_mesa)
        # Una mesa reservada no vuelve a "disponible": sigue apartada para su cliente.
        if mesa and mesa.estado != "reservada":
            mesa.estado = "disponible"
