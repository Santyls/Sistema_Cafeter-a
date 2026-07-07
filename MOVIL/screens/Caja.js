import React, { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { MESAS } from "./CAJA/data/mesas";
import { PRODUCTOS } from "./CAJA/data/productos";

import Login from "./CAJA/login";
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

export default function Caja({ onBack }) {
  const [pantalla, setPantalla] = useState("login");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mesas] = useState(MESAS);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [pedido, setPedido] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [montoRecibido, setMontoRecibido] = useState("");

  const cambiarPantalla = (p) => {
    setSidebarOpen(false);
    setPantalla(p);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const seleccionarMesa = (mesa) => setMesaSeleccionada(mesa);

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
    setPedido([]);
    setMesaSeleccionada(null);
    setMetodoPago("");
    setMontoRecibido("");
  };

  const handleLogout = () => {
    limpiarPedido();
    setPantalla("login");
  };

  const subtotal = pedido.reduce((s, p) => s + p.precio * p.cantidad, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const cambio = Math.max(0, parseFloat(montoRecibido || 0) - total);

  const renderPantalla = () => {
    switch (pantalla) {
      case "login":
        return <Login cambiarPantalla={cambiarPantalla} onBack={onBack} />;
      case "aperturaTurno":
        return <AperturaTurno cambiarPantalla={cambiarPantalla} />;
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
          />
        );
      case "gastos":
        return (
          <Gastos
            cambiarPantalla={cambiarPantalla}
            toggleSidebar={toggleSidebar}
          />
        );
      case "suministros":
        return (
          <Suministros
            cambiarPantalla={cambiarPantalla}
            toggleSidebar={toggleSidebar}
          />
        );
      case "corteCaja":
        return (
          <CorteCaja
            cambiarPantalla={cambiarPantalla}
            toggleSidebar={toggleSidebar}
          />
        );
      case "historialTickets":
        return (
          <HistorialTickets
            cambiarPantalla={cambiarPantalla}
            toggleSidebar={toggleSidebar}
          />
        );
      case "perfil":
        return <Perfil cambiarPantalla={cambiarPantalla} toggleSidebar={toggleSidebar} onLogout={handleLogout} />;
      default:
        return <Login cambiarPantalla={cambiarPantalla} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {renderPantalla()}
      {pantalla !== "login" && pantalla !== "aperturaTurno" && (
        <SidebarCaja
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentScreen={pantalla}
          navigate={cambiarPantalla}
          onLogout={handleLogout}
        />
      )}
    </View>
  );
}
