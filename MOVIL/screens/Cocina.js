import React, { useState } from 'react';
import { View } from 'react-native';
import FadeInView from './shared/FadeInView';

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

import { API_BASE_URL } from '../config/api';
const INITIAL_ORDERS = [];

const INITIAL_INVENTORY = [
  { name: 'Cafe en grano', category: 'Cafe', actual: 2, minimum: 5, unit: 'kg' },
  { name: 'Leche entera', category: 'Lacteos', actual: 8, minimum: 10, unit: 'L' },
  { name: 'Leche deslactosada', category: 'Lacteos', actual: 3, minimum: 5, unit: 'L' },
  { name: 'Pan para panini', category: 'Panaderia', actual: 20, minimum: 15, unit: 'pzas' },
  { name: 'Croissants', category: 'Panaderia', actual: 4, minimum: 10, unit: 'pzas' },
  { name: 'Azucar', category: 'Otros', actual: 3, minimum: 2, unit: 'kg' },
  { name: 'Chocolate en polvo', category: 'Otros', actual: 1.5, minimum: 2, unit: 'kg' },
  { name: 'Jarabe de vainilla', category: 'Otros', actual: 0.8, minimum: 1, unit: 'L' },
];

const INITIAL_NOTIFICATIONS = [];

export default function Cocina(props) {
  const { onBack, token, setToken } = props;
  const [screen, setScreen] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const [localOrders, setLocalOrders] = useState(INITIAL_ORDERS);
  const orders = props.orders || localOrders;
  const setOrders = props.setOrders || setLocalOrders;

  const [localInventory, setLocalInventory] = useState(INITIAL_INVENTORY);
  const inventory = props.inventory || localInventory;
  const setInventory = props.setInventory || setLocalInventory;

  const [localNotifications, setLocalNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifications = props.notifications || localNotifications;
  const setNotifications = props.setNotifications || setLocalNotifications;

  const [ordersFilter, setOrdersFilter] = useState('Todos');

  const navigate = (target, params) => {
    setSidebarOpen(false);
    if (params && params.filter === 'pendiente') {
      setOrdersFilter('Pendientes');
      setScreen('pedidos');
      return;
    }
    setOrdersFilter('Todos');
    setScreen(target);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogin = (username, password, apiToken) => {
    setCurrentUser(username || 'cocinero1');
    if (setToken) setToken(apiToken);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen('login');
    if (onBack) onBack();
  };

  const removeCancelledItemsFromCart = (order) => {
    if (!order || !props.setTableCarts) return;
    const targetTableId = order.tableId || order.table_id;
    if (!targetTableId) return;
    props.setTableCarts(prevCarts => {
      const updated = { ...prevCarts };
      if (updated[targetTableId]) {
        const cancelledItems = order.items || order.products || [];
        updated[targetTableId] = updated[targetTableId]
          .map(cartItem => {
            const match = cancelledItems.find(ci => 
              (String(ci.id) === String(cartItem.product?.id) || ci.name === cartItem.product?.name)
            );
            if (match) {
              const newQty = Math.max(0, cartItem.qty - match.qty);
              const singlePrice = cartItem.calculatedPrice / cartItem.qty;
              return {
                ...cartItem,
                qty: newQty,
                sentQty: Math.max(0, (cartItem.sentQty || 0) - match.qty),
                calculatedPrice: singlePrice * newQty
              };
            }
            return cartItem;
          })
          .filter(cartItem => cartItem.qty > 0);
      }
      return updated;
    });
  };

  const handleSelectOrder = (id) => setActiveOrderId(id);

  const handleStartPreparation = (id) => {
    fetch(`${API_BASE_URL}/pedidos/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        estado: 'en_preparacion',
        comentario: 'Iniciando preparacion'
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || 'No se pudo iniciar preparacion en la base de datos.');
          });
        }
        return res.json();
      })
      .then(() => {
        setOrders((prev) => {
          const index = prev.findIndex((o) => String(o.id) === String(id));
          if (index === -1) return prev;
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: 'en_preparacion',
            cook: currentUser || 'Cocinero',
            history: [
              ...(updated[index].history || []),
              { time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), status: 'en_preparacion', user: currentUser || 'Cocinero', comment: 'Iniciando preparacion' },
            ],
          };
          return updated;
        });
      })
      .catch(error => {
        const { Alert } = require('react-native');
        Alert.alert('Error', error.message || 'No se pudo sincronizar con el servidor.');
      });
  };

  const handleUpdateStatus = (id, newStatus, comment) => {
    fetch(`${API_BASE_URL}/pedidos/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        estado: newStatus,
        comentario: comment || ''
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || 'No se pudo actualizar el estado en la base de datos.');
          });
        }
        return res.json();
      })
      .then(() => {
        setOrders((prev) => {
          const index = prev.findIndex((o) => String(o.id) === String(id));
          if (index === -1) return prev;
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: newStatus,
            history: [
              ...(updated[index].history || []),
              { time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), status: newStatus, user: currentUser || 'Cocinero', comment: comment || '' },
            ],
          };
          return updated;
        });
        if (newStatus === 'listo') {
          const order = orders.find(o => String(o.id) === String(id));
          const tableName = order ? (order.tableName || order.table) : `Mesa`;
          setNotifications(prev => [
            {
              id: Date.now(),
              type: 'ready',
              message: `Pedido #${id} listo para servir - ${tableName}`,
              time: 'Hace un momento',
              read: false
            },
            ...prev
          ]);
        } else if (newStatus === 'cancelado') {
          const order = orders.find(o => String(o.id) === String(id));
          const targetTableId = order ? (order.tableId || order.table_id) : null;
          if (order) {
            removeCancelledItemsFromCart(order);
          }
          if (targetTableId && props.setTables) {
            props.setTables(prevTables => prevTables.map(t => {
              if (String(t.id) === String(targetTableId)) {
                const otherActiveOrders = orders.filter(o => 
                  String(o.tableId) === String(targetTableId) && 
                  String(o.id) !== String(id) && 
                  o.status !== 'cancelado' && 
                  o.status !== 'entregado_pagado'
                );
                if (otherActiveOrders.length > 0) {
                  const cancelledTotal = order ? (order.total || 0) : 0;
                  const newTotal = Math.max(0, (t.totalAccount || 0) - cancelledTotal);
                  return { ...t, totalAccount: newTotal };
                } else {
                  return { ...t, status: 'available', totalAccount: 0 };
                }
              }
              return t;
            }));
          }
          setNotifications(prev => [
            {
              id: Date.now(),
              type: 'cancellation',
              message: `Pedido #${id} cancelado por cocina. Motivo: "${comment}"`,
              time: 'Hace un momento',
              read: false
            },
            ...prev
          ]);
        }
      })
      .catch(error => {
        const { Alert } = require('react-native');
        Alert.alert('Error al actualizar estado', error.message || 'No se pudo sincronizar con el servidor.');
      });
  };

  const handleMarkNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleCancelOrder = (id) => {
    fetch(`${API_BASE_URL}/pedidos/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        estado: 'cancelado',
        comentario: 'Cancelado por el cocinero'
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || 'No se pudo cancelar el pedido en la base de datos.');
          });
        }
        return res.json();
      })
      .then(() => {
        setOrders((prev) => prev.map((o) => String(o.id) === String(id) ? { ...o, status: 'cancelado' } : o));
        const order = orders.find(o => String(o.id) === String(id));
        const targetTableId = order ? (order.tableId || order.table_id) : null;
        if (order) {
          removeCancelledItemsFromCart(order);
        }
        if (targetTableId && props.setTables) {
          props.setTables(prevTables => prevTables.map(t => {
            if (String(t.id) === String(targetTableId)) {
              const otherActiveOrders = orders.filter(o => 
                String(o.tableId) === String(targetTableId) && 
                String(o.id) !== String(id) && 
                o.status !== 'cancelado' && 
                o.status !== 'entregado_pagado'
              );
              if (otherActiveOrders.length > 0) {
                const cancelledTotal = order ? (order.total || 0) : 0;
                const newTotal = Math.max(0, (t.totalAccount || 0) - cancelledTotal);
                return { ...t, totalAccount: newTotal };
              } else {
                return { ...t, status: 'available', totalAccount: 0 };
              }
            }
            return t;
          }));
        }
        setNotifications(prev => [
          {
            id: Date.now(),
            type: 'cancellation',
            message: `Pedido #${id} cancelado por cocina.`,
            time: 'Hace un momento',
            read: false
          },
          ...prev
        ]);
      })
      .catch(error => {
        const { Alert } = require('react-native');
        Alert.alert('Error al cancelar', error.message || 'No se pudo sincronizar con el servidor.');
      });
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleMarkAlertsAsAddressed = () => {};

  const handleRestockItem = (itemName, amount) => {
    setInventory((prev) =>
      prev.map((i) => (i.name === itemName ? { ...i, actual: i.actual + amount } : i))
    );
  };

  const commonProps = { navigate, toggleSidebar, orders, inventory, notifications, currentUser, darkMode };

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return <LoginCocina navigate={navigate} onLogin={handleLogin} onBack={onBack} />;
      case 'recuperar':
        return <RecuperarContrasena navigate={navigate} />;
      case 'dashboard':
        return <DashboardCocina {...commonProps} />;
      case 'pedidos':
        return <ListaPedidos {...commonProps} onSelectOrder={handleSelectOrder} defaultFilter={ordersFilter} />;
      case 'detalle_pedido':
        return (
          <DetallePedido
            navigate={navigate}
            activeOrderId={activeOrderId}
            orders={orders}
            onStartPreparation={handleStartPreparation}
            onCancelOrder={handleCancelOrder}
            onUpdateStatus={handleUpdateStatus}
            darkMode={darkMode}
          />
        );
      case 'actualizar_estado':
        return (
          <ActualizarEstado
            navigate={navigate}
            activeOrderId={activeOrderId}
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            darkMode={darkMode}
          />
        );
      case 'preparacion':
        return <PedidosPreparacion {...commonProps} onSelectOrder={handleSelectOrder} />;
      case 'listos':
        return <PedidosListos {...commonProps} />;
      case 'historial':
        return <Historial {...commonProps} onSelectOrder={handleSelectOrder} />;
      case 'inventario':
        return <Inventario {...commonProps} onRestockItem={handleRestockItem} />;
      case 'stock_bajo':
        return (
          <StockBajo
            navigate={navigate}
            inventory={inventory}
            onMarkAlertsAsAddressed={handleMarkAlertsAsAddressed}
            onRestockItem={handleRestockItem}
            darkMode={darkMode}
          />
        );
      case 'notificaciones':
        return (
          <Notificaciones
            navigate={navigate}
            notifications={notifications}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            onClearNotifications={handleClearNotifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onSelectOrder={handleSelectOrder}
            orders={orders}
            darkMode={darkMode}
          />
        );
      case 'configuracion':
        return <Configuracion {...commonProps} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return <DashboardCocina {...commonProps} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FadeInView key={screen} style={{ flex: 1 }} translateY={10}>
        {renderScreen()}
      </FadeInView>
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
