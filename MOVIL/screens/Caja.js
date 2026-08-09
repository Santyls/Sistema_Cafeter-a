import React, { useState } from "react";
import { View, Modal, TouchableOpacity, Text, StyleSheet, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import FadeInView from "./shared/FadeInView";

import { MESAS } from "./CAJA/data/mesas";
import { PRODUCTOS } from "./CAJA/data/productos";

import AperturaTurno from "./CAJA/aperturaTurno";
import Inicio from "./CAJA/inicio";
import Pedido from "./CAJA/pedido";
import Confirmar from "./CAJA/confirmar";
import Pago from "./CAJA/pago";
import Exitoso from "./CAJA/exitoso";
import InyeccionOrden from "./CAJA/inyeccionOrden";
import CancelarPedido from "./CAJA/cancelarPedido";
import PedidoListo from "./CAJA/pedidoListo";
import Ticket from "./CAJA/ticket";
import Gastos from "./CAJA/gastos";
import Suministros from "./CAJA/suministros";
import CorteCaja from "./CAJA/corteCaja";
import HistorialTickets from "./CAJA/historialTickets";
import Perfil from "./CAJA/perfil";
import SidebarCaja from "./CAJA/components/SidebarCaja";

import { API_BASE_URL } from '../config/api';
export default function Caja(props) {
  const { onBack, token, setToken } = props;
  // La sesion ya viene del login unificado; el turno arranca en apertura de caja.
  const [pantalla, setPantalla] = useState("aperturaTurno");
  const [usuarioLogueado, setUsuarioLogueado] = useState(props.sessionUser || null);
  const [idCajaActiva, setIdCajaActiva] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mesas = (props.tables || []).map(t => ({
    id: t.id,
    numero: t.id,
    estado: t.waitingPayment ? "Esperando Pago" : (t.status === "busy" ? "Ocupada" : "Libre"),
    tiempo: t.waitTime || "--",
    personas: t.occupants ? parseInt(t.occupants.split('/')[0]) : 0,
    total: t.totalAccount ? t.totalAccount.toFixed(2) : "0.00",
    waitingPayment: t.waitingPayment
  }));
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [cancellationReasonModal, setCancellationReasonModal] = useState(null);
  const [cancelledItemsToHighlight, setCancelledItemsToHighlight] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [pedido, setPedido] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [montoRecibido, setMontoRecibido] = useState("");

  React.useEffect(() => {
    if (mesaSeleccionada && props.tableCarts && props.tableCarts[mesaSeleccionada.id]) {
      const mapped = props.tableCarts[mesaSeleccionada.id]
        .map((item, idx) => ({
          id: idx,
          nombre: item.product?.name || item.name,
          cantidad: item.qty,
          precio: item.product?.price || item.precio || 0
        }));
      setPedido(mapped);
    }
  }, [mesaSeleccionada, props.tableCarts]);

  const cambiarPantalla = (p) => {
    setSidebarOpen(false);
    setPantalla(p);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const seleccionarMesa = (mesa) => {
    const activeOrders = (props.orders || []).filter(o => 
      String(o.tableId) === String(mesa.id) && 
      o.status !== 'entregado_pagado' && 
      o.status !== 'cancelado'
    );

    if (activeOrders.length === 0) {
      const { Alert } = require('react-native');
      Alert.alert("Sin cuenta activa", "Esta mesa no tiene pedidos registrados pendientes de pago.");
      return;
    }

    const pendingOrder = activeOrders.find(o => o.status === 'pendiente' || o.status === 'en_preparacion');
    if (pendingOrder) {
      const { Alert } = require('react-native');
      Alert.alert(
        "No se puede cobrar",
        `El pedido #${pendingOrder.id} se encuentra en preparación o pendiente en cocina. Estatus actual: "${pendingOrder.status}".`
      );
      return;
    }

    if (!mesa.waitingPayment) {
      const { Alert } = require('react-native');
      Alert.alert(
        "No se puede cobrar",
        "El mesero no ha notificado el cobro de esta mesa a la Caja todavía."
      );
      return;
    }

    // Check if there was any cancelled order for this table
    const cancelledOrders = (props.orders || []).filter(o => 
      String(o.tableId) === String(mesa.id) && 
      o.status === 'cancelado'
    );
    
    const lastCancelledWithComment = [...cancelledOrders].reverse().find(o => 
      o.history && o.history.find(h => h.status === 'cancelado' && h.comment)
    );

    if (lastCancelledWithComment) {
      const histEntry = lastCancelledWithComment.history.find(h => h.status === 'cancelado' && h.comment);
      const reason = histEntry ? histEntry.comment : "No se especificó motivo.";
      const cancelledProductNames = (lastCancelledWithComment.items || []).map(item => item.name || item.product?.name).join(', ') || "No especificado";
      
      const cancelledNames = (lastCancelledWithComment.items || []).map(item => item.name || item.product?.name).filter(Boolean);
      setCancelledItemsToHighlight(cancelledNames);
      
      setCancellationReasonModal({
        orderId: lastCancelledWithComment.id,
        reason: reason,
        products: cancelledProductNames,
        mesaNum: mesa.numero || mesa.id,
        onConfirm: () => {
          setCancellationReasonModal(null);
          setMesaSeleccionada(mesa);
          setPantalla("pedido");
        }
      });
    } else {
      setCancelledItemsToHighlight([]);
      setMesaSeleccionada(mesa);
      setPantalla("pedido");
    }
  };

  const handleRequestDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteReason("");
  };

  const handleConfirmDeleteItem = () => {
    if (!itemToDelete || !deleteReason.trim()) return;
    
    if (mesaSeleccionada && props.setTableCarts) {
      props.setTableCarts(prevCarts => {
        const updated = { ...prevCarts };
        if (updated[mesaSeleccionada.id]) {
          updated[mesaSeleccionada.id] = updated[mesaSeleccionada.id].filter(cartItem => {
            const name = cartItem.product?.name || cartItem.name;
            return name !== itemToDelete.nombre;
          });
          
          const newCartItems = updated[mesaSeleccionada.id];
          const newCartTotal = newCartItems.reduce((acc, item) => acc + (item.calculatedPrice || 0), 0);
          
          if (props.setTables) {
            props.setTables(prevTables => prevTables.map(t => {
              if (t.id === mesaSeleccionada.id) {
                return {
                  ...t,
                  totalAccount: newCartTotal,
                  status: newCartItems.length > 0 ? 'busy' : 'available'
                };
              }
              return t;
            }));
          }
        }
        return updated;
      });
      
      if (props.setOrders) {
        props.setOrders(prev => [
          {
            id: Math.floor(Math.random() * 900 + 100).toString(),
            tableId: mesaSeleccionada.id,
            tableName: mesaSeleccionada.name || `Mesa ${mesaSeleccionada.id}`,
            waiter: 'Cajero',
            items: [{ name: itemToDelete.nombre, qty: itemToDelete.cantidad, price: itemToDelete.precio }],
            total: itemToDelete.cantidad * itemToDelete.precio,
            status: 'cancelado',
            time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            history: [
              {
                time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                status: 'cancelado',
                user: 'Cajero',
                comment: `Eliminado de cuenta por Cajero. Motivo: "${deleteReason}"`
              }
            ]
          },
          ...prev
        ]);
      }
    }
    
    setItemToDelete(null);
  };

  const agregarProducto = (producto) => {
    setPedido((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const quitarProducto = (id) => {
    setPedido((prev) => {
      const item = prev.find((p) => p.id === id);
      if (!item) return prev;
      if (item.cantidad <= 1) return prev.filter((p) => p.id !== id);
      return prev.map((p) =>
        p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p
      );
    });
  };

  const limpiarPedido = () => {
    if (mesaSeleccionada) {
      const activeOrders = (props.orders || []).filter(o => 
        String(o.tableId) === String(mesaSeleccionada.id) && 
        o.status !== 'cancelado' && 
        o.status !== 'entregado_pagado'
      );
      
      activeOrders.forEach(order => {
        // 1. Update order status to entregado
        fetch(`${API_BASE_URL}/pedidos/${order.id}/estado`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            estado: 'entregado',
            comentario: 'Pedido cobrado y entregado en Caja'
          })
        })
          .then(res => {
            if (!res.ok) throw new Error("Error updating order status");
            return res.json();
          })
          .then(() => {
            // 2. Create Ticket in the backend
            if (idCajaActiva) {
              const ticketTotal = order.total || total;
              const subVal = ticketTotal / 1.16;
              const taxVal = ticketTotal - subVal;
              
              return fetch(`${API_BASE_URL}/tickets`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  id_caja: idCajaActiva,
                  id_pedido: parseInt(order.id),
                  total: parseFloat(ticketTotal.toFixed(2)),
                  impuesto: parseFloat(taxVal.toFixed(2)),
                  descuento: 0
                })
              });
            }
          })
          .then(res => {
            if (res && res.ok) return res.json();
          })
          .then(ticketData => {
            // 3. Register the Pago in the backend to mark ticket as Paid
            if (ticketData && ticketData.id_ticket) {
              return fetch(`${API_BASE_URL}/pagos`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  id_ticket: ticketData.id_ticket,
                  monto: parseFloat((order.total || total).toFixed(2)),
                  tipo_pago: metodoPago === 'tarjeta' ? 'tarjeta' : metodoPago === 'transferencia' ? 'transferencia' : 'efectivo',
                  cambio: parseFloat((parseFloat(montoRecibido || 0) - (order.total || total)).toFixed(2)) || 0
                })
              });
            }
          })
          .catch(err => console.log('Error syncing checkout/ticket status:', err));
      });
    }

    if (mesaSeleccionada && props.setTables) {
      props.setTables(prev => prev.map(t => t.id === mesaSeleccionada.id ? { ...t, status: 'available', totalAccount: 0, waitingPayment: false } : t));
    }
    if (mesaSeleccionada && props.setTableCarts) {
      props.setTableCarts(prev => {
        const updated = { ...prev };
        delete updated[mesaSeleccionada.id];
        return updated;
      });
    }
    if (mesaSeleccionada && props.setOrders) {
      props.setOrders(prev => prev.map(o => 
        String(o.tableId) === String(mesaSeleccionada.id) && o.status !== 'cancelado'
          ? { ...o, status: 'entregado_pagado' }
          : o
      ));
    }
    setPedido([]);
    setMesaSeleccionada(null);
    setMetodoPago("");
    setMontoRecibido("");
  };

  // Cerrar sesion se delega al contenedor (App), que limpia la sesion y
  // devuelve al login unificado.
  const handleLogout = () => {
    limpiarPedido();
    if (onBack) onBack();
  };

  const subtotal = pedido.reduce((s, p) => s + p.precio * p.cantidad, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const cambio = Math.max(0, parseFloat(montoRecibido || 0) - total);

  const renderPantalla = () => {
    switch (pantalla) {
      case "aperturaTurno":
        return (
          <AperturaTurno
            cambiarPantalla={cambiarPantalla}
            token={token}
            usuarioLogueado={usuarioLogueado}
            onTurnoAbierto={(idCaja) => setIdCajaActiva(idCaja)}
          />
        );
      case "inicio":
        return (
          <Inicio
            mesas={mesas}
            cambiarPantalla={cambiarPantalla}
            seleccionarMesa={seleccionarMesa}
            toggleSidebar={toggleSidebar}
          />
        );
      case "pedido":
        return (
          <Pedido
            mesa={mesaSeleccionada}
            productos={PRODUCTOS}
            pedido={pedido}
            subtotal={subtotal}
            iva={iva}
            total={total}
            agregarProducto={agregarProducto}
            quitarProducto={quitarProducto}
            cambiarPantalla={cambiarPantalla}
            onDeleteItem={handleRequestDeleteItem}
            cancelledItemsToHighlight={cancelledItemsToHighlight}
          />
        );
      case "confirmar":
        return (
          <Confirmar
            mesa={mesaSeleccionada}
            pedido={pedido}
            subtotal={subtotal}
            iva={iva}
            total={total}
            cambiarPantalla={cambiarPantalla}
          />
        );
      case "cancelarPedido":
        return (
          <CancelarPedido
            mesa={mesaSeleccionada}
            pedido={pedido}
            subtotal={subtotal}
            iva={iva}
            total={total}
            cambiarPantalla={cambiarPantalla}
            onCancelar={limpiarPedido}
          />
        );
      case "inyeccion":
        return (
          <InyeccionOrden
            mesa={mesaSeleccionada}
            pedido={pedido}
            cambiarPantalla={cambiarPantalla}
            limpiarPedido={limpiarPedido}
          />
        );
      case "pago":
        return (
          <Pago
            total={total}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            montoRecibido={montoRecibido}
            setMontoRecibido={setMontoRecibido}
            cambio={cambio}
            cambiarPantalla={cambiarPantalla}
          />
        );
      case "exitoso":
        return (
          <Exitoso
            mesa={mesaSeleccionada}
            total={total}
            metodoPago={metodoPago}
            cambio={cambio}
            limpiarPedido={limpiarPedido}
            cambiarPantalla={cambiarPantalla}
          />
        );
      case "ticket":
        return (
          <Ticket
            mesa={mesaSeleccionada}
            pedido={pedido}
            subtotal={subtotal}
            iva={iva}
            total={total}
            metodoPago={metodoPago}
            cambiarPantalla={cambiarPantalla}
            limpiarPedido={limpiarPedido}
          />
        );
      case "pedidoListo":
        return (
          <PedidoListo
            cambiarPantalla={cambiarPantalla}
            toggleSidebar={toggleSidebar}
            orders={props.orders}
            mesas={mesas}
            seleccionarMesa={seleccionarMesa}
          />
        );
      case "gastos":
        return (
          <Gastos
            cambiarPantalla={cambiarPantalla}
            toggleSidebar={toggleSidebar}
            token={token}
            usuarioLogueado={usuarioLogueado}
            idCajaActiva={idCajaActiva}
          />
        );
      case "suministros":
        return (
          <Suministros
            cambiarPantalla={cambiarPantalla}
            toggleSidebar={toggleSidebar}
            token={token}
            usuarioLogueado={usuarioLogueado}
            idCajaActiva={idCajaActiva}
          />
        );
      case "corteCaja":
        return (
          <CorteCaja
            cambiarPantalla={cambiarPantalla}
            toggleSidebar={toggleSidebar}
            token={token}
            usuarioLogueado={usuarioLogueado}
            idCajaActiva={idCajaActiva}
          />
        );
      case "historialTickets":
        return (
          <HistorialTickets
            cambiarPantalla={cambiarPantalla}
            toggleSidebar={toggleSidebar}
            token={token}
          />
        );
      case "perfil":
        return (
          <Perfil
            cambiarPantalla={cambiarPantalla}
            toggleSidebar={toggleSidebar}
            onLogout={handleLogout}
            token={token}
            usuarioLogueado={usuarioLogueado}
          />
        );
      default:
        return (
          <AperturaTurno
            cambiarPantalla={cambiarPantalla}
            token={token}
            usuarioLogueado={usuarioLogueado}
            onTurnoAbierto={(idCaja) => setIdCajaActiva(idCaja)}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A1931" }}>
      <StatusBar style="light" />
      <FadeInView key={pantalla} style={{ flex: 1 }} translateY={10}>
        {renderPantalla()}
      </FadeInView>
      {pantalla !== "aperturaTurno" && (
        <SidebarCaja
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentScreen={pantalla}
          navigate={cambiarPantalla}
          onLogout={handleLogout}
        />
      )}

      {/* Cancellation Reason bottom sheet modal */}
      {cancellationReasonModal && (
        <Modal
          visible={!!cancellationReasonModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setCancellationReasonModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheetCard}>
              <View style={styles.dragBar} />
              
              <View style={styles.warningHeader}>
                <Text style={styles.warningTitle}>⚠️ Pedido Cancelado</Text>
                <Text style={styles.warningSubtitle}>
                  Un pedido de la Mesa {cancellationReasonModal.mesaNum} fue cancelado en cocina y no se cobrará.
                </Text>
              </View>

              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>Producto(s) Cancelado(s):</Text>
                <Text style={[styles.reasonText, { marginBottom: 12, color: "#B71C1C", fontWeight: "bold", fontStyle: "normal" }]}>
                  {cancellationReasonModal.products}
                </Text>

                <Text style={styles.reasonLabel}>Motivo de la cancelación:</Text>
                <Text style={styles.reasonText}>"{cancellationReasonModal.reason}"</Text>
              </View>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={cancellationReasonModal.onConfirm}
              >
                <Text style={styles.confirmBtnText}>Entendido, proceder al cobro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Delete Item Modal */}
      {itemToDelete && (
        <Modal
          visible={!!itemToDelete}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setItemToDelete(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheetCard}>
              <View style={styles.dragBar} />
              
              <View style={styles.warningHeader}>
                <Text style={[styles.warningTitle, { color: "#D32F2F" }]}>⚠️ Eliminar Producto</Text>
                <Text style={styles.warningSubtitle}>
                  ¿Estás seguro de que deseas eliminar "{itemToDelete.nombre}" (x{itemToDelete.cantidad}) de la cuenta de la mesa?
                </Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 8 }}>
                  Motivo de la eliminación (Obligatorio):
                </Text>
                <TextInput
                  style={styles.textInputReason}
                  placeholder="Ej: Plato devuelto, error al capturar..."
                  placeholderTextColor="#888"
                  value={deleteReason}
                  onChangeText={setDeleteReason}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={[styles.confirmBtn, { flex: 1, backgroundColor: "#E0E0E0" }]}
                  onPress={() => setItemToDelete(null)}
                >
                  <Text style={[styles.confirmBtnText, { color: "#333" }]}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmBtn, 
                    { flex: 1, backgroundColor: deleteReason.trim() ? "#D32F2F" : "#FFA7A7" }
                  ]}
                  disabled={!deleteReason.trim()}
                  onPress={handleConfirmDeleteItem}
                >
                  <Text style={styles.confirmBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    width: "100%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dragBar: {
    width: 40,
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  warningHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B71C1C",
    marginBottom: 6,
    textAlign: "center",
  },
  warningSubtitle: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    lineHeight: 20,
  },
  reasonBox: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 4,
    borderLeftColor: "#B71C1C",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#B71C1C",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "500",
    fontStyle: "italic",
  },
  confirmBtn: {
    backgroundColor: "#0A1931",
    borderRadius: 16,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  textInputReason: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#F9F9F9",
  },
});
