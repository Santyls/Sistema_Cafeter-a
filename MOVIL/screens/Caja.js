import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";

import { MESAS } from "./CAJA/data/mesas";
import { PRODUCTOS } from "./CAJA/data/productos";

import Login from "./CAJA/login";
import Inicio from "./CAJA/inicio";
import Pedido from "./CAJA/pedido";
import Confirmar from "./CAJA/confirmar";
import Pago from "./CAJA/pago";
import Exitoso from "./CAJA/exitoso";
import Perfil from "./CAJA/perfil";

export default function Caja({ onBack }) {
  const [pantalla, setPantalla] = useState("login");
  const [mesas] = useState(MESAS);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [pedido, setPedido] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [montoRecibido, setMontoRecibido] = useState("");

  const cambiarPantalla = (p) => setPantalla(p);

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

  const subtotal = pedido.reduce((s, p) => s + p.precio * p.cantidad, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const cambio = Math.max(0, parseFloat(montoRecibido || 0) - total);

  const renderPantalla = () => {
    switch (pantalla) {
      case "login":
        return <Login cambiarPantalla={cambiarPantalla} />;
      case "inicio":
        return (
          <Inicio
            mesas={mesas}
            cambiarPantalla={cambiarPantalla}
            seleccionarMesa={seleccionarMesa}
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
      case "perfil":
        return <Perfil cambiarPantalla={cambiarPantalla} />;
      default:
        return <Login cambiarPantalla={cambiarPantalla} />;
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      {renderPantalla()}
    </>
  );
}
