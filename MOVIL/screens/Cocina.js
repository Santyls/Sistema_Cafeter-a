import React, { useState } from 'react';
import { View } from 'react-native';

import LoginCocina from './cocina/LoginCocina';
import RecuperarContrasena from './cocina/RecuperarContrasena';
import DashboardCocina from './cocina/DashboardCocina';
import ListaPedidos from './cocina/ListaPedidos';
import DetallePedido from './cocina/DetallePedido';
import ActualizarEstado from './cocina/ActualizarEstado';
import PedidosPreparacion from './cocina/PedidosPreparacion';
import PedidosListos from './cocina/PedidosListos';
import Historial from './cocina/Historial';
import Inventario from './cocina/Inventario';
import StockBajo from './cocina/StockBajo';
import Notificaciones from './cocina/Notificaciones';
import Configuracion from './cocina/Configuracion';
import Sidebar from './cocina/Sidebar';

const INITIAL_ORDERS = [
  {
    id: 1001,
    table: 'Mesa 3',
    waiter: 'Carlos',
    status: 'pendiente',
    time: '14:30',
    products: [
      { name: 'Cappuccino', qty: 2 },
      { name: 'Panini Jamon', qty: 1 },
    ],
    observations: 'Sin azucar en los cappuccinos',
    estimatedTime: '15 min',
    cook: null,
    history: [
      { time: '14:30', status: 'pendiente', user: 'Sistema', comment: '' },
    ],
  },
  {
    id: 1002,
    table: 'Mesa 7',
    waiter: 'Ana',
    status: 'en_preparacion',
    time: '14:15',
    products: [
      { name: 'Latte', qty: 1 },
      { name: 'Croissant', qty: 2 },
      { name: 'Jugo Natural', qty: 1 },
    ],
    observations: 'Croissant extra tostado',
    estimatedTime: '10 min',
    cook: 'Juan',
    history: [
      { time: '14:15', status: 'pendiente', user: 'Sistema', comment: '' },
      { time: '14:18', status: 'en_preparacion', user: 'Juan', comment: 'Iniciando preparacion' },
    ],
  },
  {
    id: 1003,
    table: 'Mesa 1',
    waiter: 'Luis',
    status: 'listo',
    time: '13:45',
    products: [
      { name: 'Americano', qty: 3 },
      { name: 'Muffin Chocolate', qty: 2 },
    ],
    observations: '',
    estimatedTime: '12 min',
    cook: 'Juan',
    history: [
      { time: '13:45', status: 'pendiente', user: 'Sistema', comment: '' },
      { time: '13:48', status: 'en_preparacion', user: 'Juan', comment: '' },
      { time: '14:00', status: 'listo', user: 'Juan', comment: 'Listo en barra' },
    ],
  },
  {
    id: 1004,
    table: 'Mesa 5',
    waiter: 'Carlos',
    status: 'pendiente',
    time: '14:35',
    products: [
      { name: 'Espresso Doble', qty: 1 },
      { name: 'Sandwich Club', qty: 1 },
    ],
    observations: 'Sandwich sin tomate',
    estimatedTime: '20 min',
    cook: null,
    history: [
      { time: '14:35', status: 'pendiente', user: 'Sistema', comment: '' },
    ],
  },
];

const INITIAL_INVENTORY = [
  { name: 'Cafe en grano', category: 'Café', actual: 2, minimum: 5, unit: 'kg' },
  { name: 'Leche entera', category: 'Lácteos', actual: 8, minimum: 10, unit: 'L' },
  { name: 'Leche deslactosada', category: 'Lácteos', actual: 3, minimum: 5, unit: 'L' },
  { name: 'Pan para panini', category: 'Panadería', actual: 20, minimum: 15, unit: 'pzas' },
  { name: 'Croissants', category: 'Panadería', actual: 4, minimum: 10, unit: 'pzas' },
  { name: 'Azucar', category: 'Otros', actual: 3, minimum: 2, unit: 'kg' },
  { name: 'Chocolate en polvo', category: 'Otros', actual: 1.5, minimum: 2, unit: 'kg' },
  { name: 'Jarabe de vainilla', category: 'Otros', actual: 0.8, minimum: 1, unit: 'L' },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'new', message: 'Nuevo pedido #1004 recibido - Mesa 5', time: 'Hace 1 min', read: false },
  { id: 2, type: 'low_stock', message: 'Stock bajo: Cafe en grano (2 kg disponibles)', time: 'Hace 5 min', read: false },
  { id: 3, type: 'ready', message: 'Pedido #1003 marcado como listo', time: 'Hace 15 min', read: true },
  { id: 4, type: 'low_stock', message: 'Stock bajo: Croissants (4 pzas disponibles)', time: 'Hace 20 min', read: true },
];

export default function Cocina({ onBack }) {
  const [screen, setScreen] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const navigate = (target, params) => {
    setSidebarOpen(false);
    if (params && params.filter === 'pendiente') {
      setScreen('pedidos');
      return;
    }
    setScreen(target);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogin = (username, password) => {
    setCurrentUser(username || 'cocinero1');
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen('login');
    if (onBack) onBack();
  };

  const handleSelectOrder = (id) => setActiveOrderId(id);

  const handleStartPreparation = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'en_preparacion',
              cook: currentUser || 'Cocinero',
              history: [
                ...o.history,
                { time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), status: 'en_preparacion', user: currentUser || 'Cocinero', comment: 'Iniciando preparacion' },
              ],
            }
          : o
      )
    );
  };

  const handleUpdateStatus = (id, newStatus, comment) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: newStatus,
              history: [
                ...o.history,
                { time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), status: newStatus, user: currentUser || 'Cocinero', comment: comment || '' },
              ],
            }
          : o
      )
    );
  };

  const handleCancelOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkAlertsAsAddressed = () => {};

  const commonProps = { navigate, toggleSidebar, orders, inventory, notifications, currentUser };

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return <LoginCocina navigate={navigate} onLogin={handleLogin} onBack={onBack} />;
      case 'recuperar':
        return <RecuperarContrasena navigate={navigate} />;
      case 'dashboard':
        return <DashboardCocina {...commonProps} />;
      case 'pedidos':
        return <ListaPedidos {...commonProps} onSelectOrder={handleSelectOrder} />;
      case 'detalle_pedido':
        return (
          <DetallePedido
            navigate={navigate}
            activeOrderId={activeOrderId}
            orders={orders}
            onStartPreparation={handleStartPreparation}
            onCancelOrder={handleCancelOrder}
          />
        );
      case 'actualizar_estado':
        return (
          <ActualizarEstado
            navigate={navigate}
            activeOrderId={activeOrderId}
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case 'preparacion':
        return <PedidosPreparacion {...commonProps} onSelectOrder={handleSelectOrder} />;
      case 'listos':
        return <PedidosListos {...commonProps} />;
      case 'historial':
        return <Historial {...commonProps} />;
      case 'inventario':
        return <Inventario {...commonProps} />;
      case 'stock_bajo':
        return <StockBajo navigate={navigate} inventory={inventory} onMarkAlertsAsAddressed={handleMarkAlertsAsAddressed} />;
      case 'notificaciones':
        return <Notificaciones navigate={navigate} notifications={notifications} onMarkAllNotificationsRead={handleMarkAllNotificationsRead} />;
      case 'configuracion':
        return <Configuracion {...commonProps} onLogout={handleLogout} />;
      default:
        return <DashboardCocina {...commonProps} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      {screen !== 'login' && screen !== 'recuperar' && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentScreen={screen}
          navigate={navigate}
          onLogout={handleLogout}
        />
      )}
    </View>
  );
}
