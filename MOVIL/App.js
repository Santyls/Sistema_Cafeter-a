import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import LoginUnificado from './screens/LoginUnificado';
import ClienteMesero from './screens/ClienteMesero';
import Cocina from './screens/Cocina';
import Caja from './screens/Caja';

import { API_BASE_URL } from './config/api';
const INITIAL_ORDERS = [];

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

const INITIAL_NOTIFICATIONS = [];

const INITIAL_TABLES = [
  { id: 1, name: 'Mesa 1', status: 'available', capacity: 2, zone: 'Interior', cleanStatus: 'Limpia y lista' },
  { id: 2, name: 'Mesa 2', status: 'available', capacity: 3, zone: 'Interior', cleanStatus: 'Limpia y lista' },
  { id: 3, name: 'Mesa 3', status: 'available', capacity: 4, zone: 'Terraza', cleanStatus: 'Limpia y lista' },
  { id: 4, name: 'Mesa 4', status: 'available', capacity: 5, zone: 'Terraza', cleanStatus: 'Limpia y lista' },
  { id: 5, name: 'Mesa 5', status: 'available', capacity: 6, zone: 'Terraza', cleanStatus: 'Limpia y lista' },
  { id: 6, name: 'Mesa 6', status: 'available', capacity: 7, zone: 'Interior', cleanStatus: 'Limpia y lista' },
  { id: 7, name: 'Mesa 7', status: 'available', capacity: 8, zone: 'VIP', cleanStatus: 'Limpia y lista' },
  { id: 8, name: 'Mesa 8', status: 'available', capacity: 9, zone: 'VIP', cleanStatus: 'Limpia y lista' },
  { id: 9, name: 'Mesa 9', status: 'available', capacity: 10, zone: 'Interior', cleanStatus: 'Limpia y lista' },
  { id: 10, name: 'Mesa 10', status: 'available', capacity: 11, zone: 'Terraza', cleanStatus: 'Limpia y lista' },
  { id: 11, name: 'Mesa 11', status: 'available', capacity: 12, zone: 'VIP', cleanStatus: 'Limpia y lista' },
  { id: 12, name: 'Mesa 12', status: 'available', capacity: 15, zone: 'VIP', cleanStatus: 'Limpia y lista' },
];

export default function App() {
  // Sesion unica: el modulo se decide por el rol devuelto por la API.
  const [session, setSession] = useState(null);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [notifiedReadyOrderIds, setNotifiedReadyOrderIds] = useState([]);
  const [tableCarts, setTableCarts] = useState({});
  const [token, setToken] = useState(null);

  const module = session?.modulo || null;

  const handleLoginSuccess = ({ token: apiToken, usuario, modulo }) => {
    setToken(apiToken);
    // Se guarda el inicio de sesion para calcular la duracion real del turno.
    setSession({ usuario, modulo, inicioTurno: Date.now() });
  };

  // Cerrar sesion regresa al login y limpia los datos de la sesion anterior.
  const cerrarSesion = () => {
    setSession(null);
    setToken(null);
    setOrders(INITIAL_ORDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setTableCarts({});
    setNotifiedReadyOrderIds([]);
  };

  useEffect(() => {
    if (!token) return;

    const fetchOrdersAndTables = () => {
      // Fetch orders first
      fetch(`${API_BASE_URL}/pedidos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Error fetching orders');
          return res.json();
        })
        .then(ordersData => {
          const mappedOrders = ordersData.map(order => {
            let dateStr = order.fecha_creacion || '';
            if (dateStr && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
              dateStr += 'Z';
            }
            const dateObj = new Date(dateStr || Date.now());
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const localDateStr = `${yyyy}-${mm}-${dd}`;

            const localTimeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return {
              id: String(order.id_pedido),
              tableId: order.id_mesa,
              table: `Mesa ${order.mesa_numero || order.id_mesa}`,
              tableName: `Mesa ${order.mesa_numero || order.id_mesa}`,
              waiter: order.usuario_nombre || 'Santiago',
              status: order.estado,
              fecha: localDateStr,
              time: localTimeStr,
              timeStamp: localTimeStr,
              itemsCount: order.detalles ? order.detalles.reduce((acc, d) => acc + d.cantidad, 0) : 0,
              total: order.total,
              items: order.detalles ? order.detalles.map(d => ({
                product: { id: d.id_producto, name: d.producto_nombre, price: d.precio_unitario },
                qty: d.cantidad,
                calculatedPrice: d.subtotal,
                notes: d.observaciones || '',
                sentQty: d.cantidad
              })) : [],
              products: order.detalles ? order.detalles.map(d => ({
                name: d.producto_nombre,
                qty: d.cantidad
              })) : [],
              history: order.historial ? order.historial.map(h => {
                let hDateStr = h.fecha_cambio || '';
                if (hDateStr && !hDateStr.endsWith('Z') && !hDateStr.includes('+')) {
                  hDateStr += 'Z';
                }
                const hDate = new Date(hDateStr || Date.now());
                return {
                  time: hDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: h.estado_nuevo,
                  user: String(h.id_usuario),
                  comment: h.comentario || ''
                };
              }) : []
            };
          });
          setOrders(mappedOrders);

          // Sync table carts with active orders from DB
          const newTableCarts = {};
          ordersData.forEach(order => {
            if (order.estado !== 'entregado' && order.estado !== 'cancelado' && order.estado !== 'entregado_pagado') {
              const tableId = order.id_mesa;
              if (!newTableCarts[tableId]) {
                newTableCarts[tableId] = [];
              }
              if (order.detalles) {
                order.detalles.forEach(d => {
                  newTableCarts[tableId].push({
                    product: { id: d.id_producto, name: d.producto_nombre, price: d.precio_unitario },
                    qty: d.cantidad,
                    calculatedPrice: d.subtotal,
                    notes: d.observaciones || '',
                    sentQty: d.cantidad
                  });
                });
              }
            }
          });
          
          setTableCarts(prevCarts => {
            const merged = { ...newTableCarts };
            Object.keys(prevCarts).forEach(tableId => {
              const localCart = prevCarts[tableId] || [];
              const unsentItems = localCart.filter(item => item.qty > (item.sentQty || 0)).map(item => {
                const unsentQty = item.qty - (item.sentQty || 0);
                return {
                  ...item,
                  qty: unsentQty,
                  sentQty: 0,
                  calculatedPrice: (item.calculatedPrice / item.qty) * unsentQty
                };
              });
              if (unsentItems.length > 0) {
                const cleanTableId = String(tableId);
                // Also support key lookup in whatever form it is
                const matchedKey = Object.keys(merged).find(k => String(k) === cleanTableId) || cleanTableId;
                if (!merged[matchedKey]) {
                  merged[matchedKey] = [];
                }
                // Avoid duplicating if we already added it in this sync cycle
                unsentItems.forEach(uItem => {
                  const alreadyExists = merged[matchedKey].some(mItem => 
                    mItem.product.id === uItem.product.id && 
                    mItem.sentQty === 0 && 
                    mItem.milk === uItem.milk &&
                    mItem.extraShot === uItem.extraShot &&
                    mItem.syrupVanilla === uItem.syrupVanilla &&
                    mItem.notes === uItem.notes
                  );
                  if (!alreadyExists) {
                    merged[matchedKey].push(uItem);
                  }
                });
              }
            });
            return merged;
          });

          // Fetch tables and match active orders
          return fetch(`${API_BASE_URL}/mesas`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
            .then(res => {
              if (!res.ok) throw new Error('Error fetching tables');
              return res.json();
            })
            .then(tablesData => {
              const mappedTables = tablesData.map(m => {
                const hasActiveOrder = ordersData.some(o => 
                  String(o.id_mesa) === String(m.id_mesa) && 
                  o.estado !== 'entregado' && 
                  o.estado !== 'cancelado' && 
                  o.estado !== 'entregado_pagado'
                );

                let mappedZone = 'Interior';
                if (m.numero_mesa === 3 || m.numero_mesa === 4 || m.numero_mesa === 5 || m.numero_mesa === 10) {
                  mappedZone = 'Terraza';
                } else if (m.numero_mesa === 7 || m.numero_mesa === 8 || m.numero_mesa === 11 || m.numero_mesa === 12) {
                  mappedZone = 'VIP';
                }

                // Compute total account from ordersData
                const activeOrdersForTable = ordersData.filter(o => 
                  String(o.id_mesa) === String(m.id_mesa) && 
                  o.estado !== 'entregado' && 
                  o.estado !== 'cancelado' && 
                  o.estado !== 'entregado_pagado'
                );
                const totalAccount = activeOrdersForTable.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

                return {
                  id: m.id_mesa,
                  name: `Mesa ${m.numero_mesa}`,
                  status: (m.estado === 'ocupada' || m.estado === 'esperando_pago' || hasActiveOrder) ? 'busy' : m.estado === 'reservada' ? 'reserved' : 'available',
                  capacity: parseInt(m.capacidad) || 4,
                  zone: mappedZone,
                  cleanStatus: 'Limpia y lista',
                  totalAccount: totalAccount,
                  waitingPayment: m.estado === 'esperando_pago'
                };
              });
              console.log("RAW TABLES FROM API:", tablesData);
              
              setTables(prevTables => {
                return mappedTables.map(newTable => {
                  const existingTable = prevTables.find(t => t.id === newTable.id);
                  if (existingTable) {
                    return {
                      ...newTable,
                      // Preserve occupants if the table is busy
                      occupants: newTable.status === 'busy' ? (existingTable.occupants || `2/${newTable.capacity}`) : undefined,
                      reservedFor: newTable.status === 'reserved' ? (existingTable.reservedFor || newTable.reservedFor) : undefined,
                      waitTime: existingTable.waitTime || '5 min',
                      time: newTable.status === 'reserved' ? (existingTable.time || newTable.time) : existingTable.time,
                      note: newTable.status === 'reserved' ? (existingTable.note || newTable.note) : existingTable.note
                    };
                  }
                  return newTable;
                });
              });
            });
        })
        .catch(err => console.log('Sync polling error:', err));
    };

    fetchOrdersAndTables();
    const interval = setInterval(fetchOrdersAndTables, 4000);
    return () => clearInterval(interval);
  }, [token]);

  const sharedProps = {
    tables,
    setTables,
    orders,
    setOrders,
    inventory,
    setInventory,
    notifications,
    setNotifications,
    tableCarts,
    setTableCarts,
    notifiedReadyOrderIds,
    setNotifiedReadyOrderIds,
    token,
    setToken,
    // Usuario autenticado en el login unico; cada modulo lo usa en lugar de
    // pedir credenciales por su cuenta.
    sessionUser: session?.usuario || null,
    // Marca de tiempo del login, base para la duracion del turno.
    inicioTurno: session?.inicioTurno || null,
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A1931' }}>
      <StatusBar style="light" />
      {module === 'cliente_mesero' && <ClienteMesero onBack={cerrarSesion} {...sharedProps} />}
      {module === 'cocina' && <Cocina onBack={cerrarSesion} {...sharedProps} />}
      {module === 'caja' && <Caja onBack={cerrarSesion} {...sharedProps} />}
      {!module && <LoginUnificado onLoginSuccess={handleLoginSuccess} />}
    </View>
  );
}

