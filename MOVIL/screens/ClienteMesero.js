import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
  Dimensions,
  StatusBar as RNStatusBar,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- EXPANDED PRODUCT CATALOG ---
const PRODUCTS = [
  { id: 'p1', name: 'Café Americano', price: 45, category: 'Bebidas Calientes', ingredients: 'Café de grano recién tostado de especialidad, extracción clásica.', tag: 'Popular', time: '5 min', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto=format&fit=crop' },
  { id: 'p2', name: 'Capuchino Clásico', price: 65, category: 'Bebidas Calientes', ingredients: 'Espresso doble con leche texturizada y espuma suave.', tag: 'Clásico', time: '7 min', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop' },
  { id: 'p3', name: 'Espresso Doble', price: 55, category: 'Bebidas Calientes', ingredients: 'Extracción corta e intensa de granos seleccionados 100% Arábica.', tag: 'Intenso', time: '3 min', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop' },
  { id: 'p4', name: 'Latte de Vainilla', price: 70, category: 'Bebidas Calientes', ingredients: 'Espresso con leche cremosa y un toque de sirope artesanal de vainilla.', tag: 'Dulce', time: '6 min', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop' },
  { id: 'p5', name: 'Frappé Caramelo', price: 85, category: 'Frías', ingredients: 'Bebida fría frappé con jarabe de caramelo, crema batida y topping de caramelo.', tag: 'Popular', time: '8 min', image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=300&auto=format&fit=crop' },
  { id: 'p6', name: 'Iced Latte Avena', price: 75, category: 'Frías', ingredients: 'Espresso sobre hielo con leche de avena orgánica texturizada.', tag: 'Vegano', time: '6 min', image: 'https://images.unsplash.com/photo-1461023058043-033481440479?q=80&w=300&auto=format&fit=crop' },
  { id: 'p7', name: 'Smoothie Frutos Rojos', price: 80, category: 'Frías', ingredients: 'Mezcla cremosa de fresa, frambuesa, zarzamora y yogur natural.', tag: 'Saludable', time: '7 min', image: 'https://images.unsplash.com/photo-1553530979-7ee52a2670c2?q=80&w=300&auto=format&fit=crop' },
  { id: 'p8', name: 'Croissant Almendra', price: 65, category: 'Postres', ingredients: 'Hojaldre de mantequilla crujiente relleno de crema fina de almendras.', tag: 'Clásico', time: '4 min', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop' },
  { id: 'p9', name: 'Cheesecake Fresa', price: 80, category: 'Postres', ingredients: 'Tarta de queso crema clásica estilo New York con coulis de fresas frescas.', tag: 'Dulce', time: '5 min', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=300&auto=format&fit=crop' },
  { id: 'p10', name: 'Pastel Chocolate Amargo', price: 85, category: 'Postres', ingredients: 'Bizcocho húmedo de chocolate oscuro de especialidad 70% cacao mexicano.', tag: 'Popular', time: '5 min', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=300&auto=format&fit=crop' },
  { id: 'p11', name: 'Chilaquiles Verdes', price: 110, category: 'Desayunos', ingredients: 'Totopos de maíz crujientes en salsa verde, crema ácida, queso fresco y cebolla.', tag: 'Picante', time: '12 min', image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?q=80&w=300&auto=format&fit=crop' },
  { id: 'p12', name: 'Avocado Toast', price: 120, category: 'Desayunos', ingredients: 'Pan de masa madre tostado, puré de aguacate sazonado, huevo pochado y semillas.', tag: 'Saludable', time: '10 min', image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=300&auto=format&fit=crop' }
];

// --- ANIMATION HELPER COMPONENTS ---
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const FadeInView = ({ children, style, duration = 300, delay = 0, ...props }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

const ScaleInButton = ({ children, onPress, style, ...props }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 20,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 3,
    }).start();
  };

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, { transform: [{ scale: scaleValue }] }]}
      activeOpacity={0.85}
      {...props}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
};

export default function ClienteMesero({ onBack }) {
  // --- AUTH / PROFILE STATE ---
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Waiter profile fields
  const [editName, setEditName] = useState('Alberto Luna');
  const [editEmail, setEditEmail] = useState('alberto.luna@coffeeflow.com');
  const [editPhone, setEditPhone] = useState('+52 442 000 0000');

  // Waiter shift statistics
  const [salesTotal, setSalesTotal] = useState(1480.00);
  const [activeTablesCount, setActiveTablesCount] = useState(2);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(9);
  const [clockedIn, setClockedIn] = useState(true);
  const [shiftTime, setShiftTime] = useState('04:12 hrs');

  // --- SCREEN NAVIGATION STATE ---
  const [currentScreen, setCurrentScreen] = useState('login'); // login, recovery, mesas, menu, customization, summary, tracking, details, close_account, config, edit_profile, statistics, notifications_history
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [showReceptionWizard, setShowReceptionWizard] = useState(false);
  const [wizardPartyCount, setWizardPartyCount] = useState(2);

  // --- SEARCH, FILTERS & SORTING ---
  const [selectedTableStatus, setSelectedTableStatus] = useState('Todas');
  const [selectedTableZone, setSelectedTableZone] = useState('Todas');
  const [partyCount, setPartyCount] = useState(4);

  // Menu catalog filters
  const [activeCategory, setActiveCategory] = useState('Bebidas Calientes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('Todos');
  const [menuSortOption, setMenuSortOption] = useState('Default');

  // Orders filters
  const [selectedOrderTrackingFilter, setSelectedOrderTrackingFilter] = useState('Todos');

  // --- TABLES STATE ---
  const [tables, setTables] = useState([
    { id: 1, name: 'Mesa 1', status: 'available', capacity: 2, zone: 'Interior', cleanStatus: 'Limpia y lista' },
    { id: 2, name: 'Mesa 2', status: 'busy', capacity: 4, zone: 'Interior', occupants: '2/4', waiter: 'Cristian', waitTime: 'Hace 45 min', totalAccount: 450.00 },
    { id: 3, name: 'Mesa 3', status: 'available', capacity: 4, zone: 'Terraza', cleanStatus: 'Limpia y lista' },
    { id: 4, name: 'Mesa 4', status: 'available', capacity: 6, zone: 'Terraza', cleanStatus: '✨ Limpia y lista' },
    { id: 5, name: 'Mesa 5', status: 'busy', capacity: 2, zone: 'Terraza', occupants: '1/2', waiter: 'Alberto Luna', waitTime: 'Hace 10 min', totalAccount: 185.00 },
    { id: 7, name: 'Mesa 7', status: 'reserved', capacity: 4, zone: 'VIP', reservedFor: 'Diego', time: 'Hoy a las 20:00', note: 'Llegan en ~30 min' },
    { id: 8, name: 'Mesa 8', status: 'available', capacity: 8, zone: 'VIP', cleanStatus: '✨ Limpia y lista' },
  ]);
  const [activeTableId, setActiveTableId] = useState(4);

  // --- TABLE QUICK DRAWER BOTOM SHEET ---
  const [isTableDetailDrawerVisible, setIsTableDetailDrawerVisible] = useState(false);
  const [selectedTableForDrawer, setSelectedTableForDrawer] = useState(null);

  // --- TRANSFER & MERGE CONTROL STATES ---
  const [showTableActionModal, setShowTableActionModal] = useState(false);
  const [selectedTableAction, setSelectedTableAction] = useState(null); // 'Transfer', 'Merge'
  const [destinationTableId, setDestinationTableId] = useState('');

  // --- PRODUCT CUSTOMIZATION STATE ---
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [selectedMilk, setSelectedMilk] = useState('Entera');
  const [extraShot, setExtraShot] = useState(false);
  const [syrupVanilla, setSyrupVanilla] = useState(true);
  const [specialNotes, setSpecialNotes] = useState('');
  const [customQty, setCustomQty] = useState(1);

  // Comanda Cart
  const [tableCarts, setTableCarts] = useState({});
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountReason, setDiscountReason] = useState('');

  // Cooking Tracking State
  const [orders, setOrders] = useState([
    { id: '15', tableId: 3, status: 'pending', itemsCount: 1, tableName: 'Mesa 3', timeStamp: '10:35 AM' },
    { id: '16', tableId: 4, status: 'progress', itemsCount: 2, tableName: 'Mesa 4', timeStamp: '10:40 AM' },
    { id: '17', tableId: 2, status: 'ready', itemsCount: 3, tableName: 'Mesa 2', timeStamp: '10:15 AM' },
    { id: '18', tableId: 1, status: 'delivered', itemsCount: 2, tableName: 'Mesa 1', timeStamp: '09:45 AM' },
  ]);
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState('16');

  // Billing states
  const [billingTableId, setBillingTableId] = useState(4);
  const [tipPercentage, setTipPercentage] = useState(10);
  const [customTip, setCustomTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta');

  // --- NOTIFICATION LOG STATE ---
  const [notificationHistory, setNotificationHistory] = useState([
    { id: '1', type: 'system', message: 'Turno de mesero iniciado con éxito.', time: '10:00 AM', read: true },
    { id: '2', type: 'kitchen', message: 'Comanda #17 (Mesa 2) está LISTA en barra.', time: '10:15 AM', read: false },
    { id: '3', type: 'kitchen', message: 'Comanda #16 (Mesa 4) cambió a Preparación.', time: '10:40 AM', read: false }
  ]);

  // --- ACTIONS SLIDE BANNER ---
  const notificationAnim = useRef(new Animated.Value(-120)).current;
  const [kitchenNotification, setKitchenNotification] = useState(null);
  const sidebarAnim = useRef(new Animated.Value(-280)).current;

  const triggerAlertNotification = (message, type = 'system') => {
    if (!notifications) return;

    const newLog = {
      id: Math.random().toString(),
      type,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotificationHistory(prev => [newLog, ...prev]);

    setKitchenNotification(message);
    Animated.sequence([
      Animated.timing(notificationAnim, {
        toValue: Platform.OS === 'ios' ? 20 : 10,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.delay(3500),
      Animated.timing(notificationAnim, {
        toValue: -120,
        duration: 350,
        useNativeDriver: true,
      })
    ]).start(() => setKitchenNotification(null));
  };

  const toggleSidebar = (open) => {
    if (open) {
      setSidebarOpen(true);
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: -280,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setSidebarOpen(false));
    }
  };

  // --- ACTIONS HANDLERS ---

  const handleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      const finalName = loginEmail.trim() ? loginEmail.split('@')[0] : 'Alberto Luna';
      const finalEmail = loginEmail.trim() ? loginEmail : 'alberto.luna@coffeeflow.com';

      const loggedUser = {
        name: finalName.charAt(0).toUpperCase() + finalName.slice(1),
        email: finalEmail,
        phone: '+52 442 000 0000',
        role: 'Mesero'
      };

      setCurrentUser(loggedUser);
      setEditName(loggedUser.name);
      setEditEmail(loggedUser.email);
      setEditPhone(loggedUser.phone);
      setCurrentScreen('mesas');
      setIsLoggingIn(false);

      setTimeout(() => {
        triggerAlertNotification(`🔑 Turno de ${loggedUser.name} iniciado.`);
      }, 500);
    }, 1200);
  };

  const handleRecovery = () => {
    if (!recoveryEmail) {
      Alert.alert('Error', 'Ingresa tu correo electrónico.');
      return;
    }
    Alert.alert(
      'Código Enviado',
      `Se ha enviado un código de recuperación a ${recoveryEmail}.`,
      [{ text: 'Aceptar', onPress: () => setCurrentScreen('login') }]
    );
  };

  const getProductQtyInCart = (productId) => {
    const cart = tableCarts[activeTableId] || [];
    const items = cart.filter(item => item.product.id === productId);
    return items.reduce((acc, item) => acc + item.qty, 0);
  };

  const handleQuickAdd = (product) => {
    setTableCarts(prevCarts => {
      const currentCart = [...(prevCarts[activeTableId] || [])];
      const existingItemIndex = currentCart.findIndex(item => item.product.id === product.id && !item.extraShot && item.milk === 'Entera' && !item.notes);

      if (existingItemIndex > -1) {
        currentCart[existingItemIndex] = {
          ...currentCart[existingItemIndex],
          qty: currentCart[existingItemIndex].qty + 1,
          calculatedPrice: currentCart[existingItemIndex].product.price * (currentCart[existingItemIndex].qty + 1)
        };
      } else {
        currentCart.push({
          product,
          qty: 1,
          milk: 'Entera',
          extraShot: false,
          syrupVanilla: false,
          notes: '',
          calculatedPrice: product.price
        });
      }
      return { ...prevCarts, [activeTableId]: currentCart };
    });
    triggerAlertNotification(`🛒 ${product.name} (x1) agregado.`);
  };

  const handleQuickRemove = (product) => {
    setTableCarts(prevCarts => {
      const currentCart = [...(prevCarts[activeTableId] || [])];
      const existingItemIndex = currentCart.findIndex(item => item.product.id === product.id);

      if (existingItemIndex > -1) {
        if (currentCart[existingItemIndex].qty > 1) {
          const singleItemPrice = currentCart[existingItemIndex].calculatedPrice / currentCart[existingItemIndex].qty;
          currentCart[existingItemIndex] = {
            ...currentCart[existingItemIndex],
            qty: currentCart[existingItemIndex].qty - 1,
            calculatedPrice: singleItemPrice * (currentCart[existingItemIndex].qty - 1)
          };
        } else {
          currentCart.splice(existingItemIndex, 1);
        }
      }
      return { ...prevCarts, [activeTableId]: currentCart };
    });
    triggerAlertNotification(`🛒 ${product.name} removido.`);
  };

  const handleCustomizeProduct = (product) => {
    setCustomizingProduct(product);
    setSelectedMilk('Entera');
    setExtraShot(false);
    setSyrupVanilla(false);
    setSpecialNotes('');
    setCustomQty(1);
    setCurrentScreen('customization');
  };

  const calculateCustomizedPrice = () => {
    if (!customizingProduct) return 0;
    const basePrice = customizingProduct.price;
    const milkPrice = selectedMilk === 'Avena' ? 15 : 0;
    const extraShotPrice = extraShot ? 12 : 0;
    const syrupPrice = syrupVanilla ? 10 : 0;
    return (basePrice + milkPrice + extraShotPrice + syrupPrice) * customQty;
  };

  const handleOpenMesa = (table) => {
    setTables(prevTables =>
      prevTables.map(t => (t.id === table.id ? { ...t, status: 'busy', occupants: `${partyCount}/${t.capacity}`, totalAccount: 0 } : t))
    );
    setActiveTableId(table.id);
    setActiveTablesCount(prev => prev + 1);
    setIsTableDetailDrawerVisible(false);
    setCurrentScreen('menu');

    triggerAlertNotification(`📍 ${table.name} asignada a ${partyCount} personas.`);
  };

  const handleAddToCart = () => {
    const singlePrice = customizingProduct.price + (selectedMilk === 'Avena' ? 15 : 0) + (extraShot ? 12 : 0) + (syrupVanilla ? 10 : 0);
    const item = {
      product: customizingProduct,
      qty: customQty,
      milk: selectedMilk,
      extraShot,
      syrupVanilla,
      notes: specialNotes,
      calculatedPrice: singlePrice * customQty,
    };

    setTableCarts(prevCarts => {
      const currentCart = prevCarts[activeTableId] || [];
      return {
        ...prevCarts,
        [activeTableId]: [...currentCart, item]
      };
    });

    triggerAlertNotification(`🛒 ${customizingProduct.name} (x${customQty}) agregado.`);
    setCurrentScreen('menu');
  };

  const handleConfirmOrder = () => {
    const cart = tableCarts[activeTableId] || [];
    if (cart.length === 0) {
      Alert.alert('Comanda Vacía', 'No hay productos para enviar a cocina.');
      return;
    }

    setIsSendingOrder(true);
    setTimeout(() => {
      const nextOrderId = (Math.floor(Math.random() * 900) + 100).toString();
      const newOrder = {
        id: nextOrderId,
        tableId: activeTableId,
        status: 'pending',
        itemsCount: cart.reduce((acc, item) => acc + item.qty, 0),
        tableName: `Mesa ${activeTableId}`,
        timeStamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: cart
      };

      setOrders([newOrder, ...orders]);
      setSelectedTrackingOrderId(nextOrderId);

      const cartSub = cart.reduce((acc, item) => acc + item.calculatedPrice, 0);
      const withDiscount = cartSub * (1 - discountPercent / 100);
      const totalWithTax = parseFloat((withDiscount * 1.16).toFixed(2));

      setTables(prevTables =>
        prevTables.map(t => {
          if (t.id === activeTableId) {
            const currentTotal = t.totalAccount || 0;
            return { ...t, totalAccount: currentTotal + totalWithTax };
          }
          return t;
        })
      );

      setTableCarts(prevCarts => {
        const updated = { ...prevCarts };
        delete updated[activeTableId];
        return updated;
      });
      setDiscountPercent(0);
      setDiscountReason('');
      setIsSendingOrder(false);

      triggerAlertNotification(`🍳 Pedido #${nextOrderId} enviado a Cocina.`);
      setCurrentScreen('tracking');
    }, 1500);
  };

  const handleConfirmPayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setSalesTotal(prev => prev + billingTotalToPay);
      setCompletedOrdersCount(prev => prev + 1);
      setActiveTablesCount(prev => Math.max(0, prev - 1));

      setTables(prevTables =>
        prevTables.map(t => (t.id === billingTableId ? { ...t, status: 'available', totalAccount: 0 } : t))
      );

      setIsPaying(false);
      triggerAlertNotification(`🧾 Mesa ${billingTableId} pagada y liberada.`, 'system');
      setCurrentScreen('mesas');
    }, 1500);
  };

  const executeTableAction = () => {
    const originId = activeTableId;
    const destId = parseInt(destinationTableId);

    if (!destId || originId === destId) {
      Alert.alert('Error', 'Ingresa una mesa de destino válida y diferente a la actual.');
      return;
    }

    const originTable = tables.find(t => t.id === originId) || {};
    const destTable = tables.find(t => t.id === destId) || {};

    if (!destTable) {
      Alert.alert('Error', 'La mesa de destino no existe.');
      return;
    }

    if (selectedTableAction === 'Transfer') {
      setTables(prevTables =>
        prevTables.map(t => {
          if (t.id === originId) return { ...t, status: 'available', totalAccount: 0 };
          if (t.id === destId) return { ...t, status: 'busy', totalAccount: originTable.totalAccount || 0, occupants: originTable.occupants, waiter: originTable.waiter };
          return t;
        })
      );
      triggerAlertNotification(`🔄 Mesa ${originId} transferida a Mesa ${destId}.`);
    } else {
      setTables(prevTables =>
        prevTables.map(t => {
          if (t.id === originId) return { ...t, status: 'available', totalAccount: 0 };
          if (t.id === destId) return { ...t, status: 'busy', totalAccount: (destTable.totalAccount || 0) + (originTable.totalAccount || 0) };
          return t;
        })
      );
      triggerAlertNotification(`➕ Cuentas de Mesa ${originId} y Mesa ${destId} unificadas.`);
    }

    setShowTableActionModal(false);
    setDestinationTableId('');
    setIsTableDetailDrawerVisible(false);
    setCurrentScreen('mesas');
  };

  const handleUpdateProfile = () => {
    if (!editName || !editEmail || !editPhone) {
      Alert.alert('Error', 'Nombre, correo y teléfono son obligatorios.');
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: editName,
      email: editEmail,
      phone: editPhone
    };

    setCurrentUser(updatedUser);
    Alert.alert('Perfil Guardado', 'Los datos personales han sido actualizados con éxito.');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginEmail('');
    setLoginPassword('');
    toggleSidebar(false);
    setCurrentScreen('login');
  };

  // --- FILTERS LOGIC ---
  const filteredTables = tables.filter(table => {
    let statusMatch = true;
    if (selectedTableStatus === 'Libres') statusMatch = table.status === 'available';
    else if (selectedTableStatus === 'Ocupadas') statusMatch = table.status === 'busy';
    else if (selectedTableStatus === 'Reservadas') statusMatch = table.status === 'reserved';

    let zoneMatch = true;
    if (selectedTableZone !== 'Todas') zoneMatch = table.zone === selectedTableZone;

    return statusMatch && zoneMatch;
  });

  const sortedProducts = [...PRODUCTS].sort((a, b) => {
    if (menuSortOption === 'PriceAsc') return a.price - b.price;
    if (menuSortOption === 'PriceDesc') return b.price - a.price;
    if (menuSortOption === 'NameAsc') return a.name.localeCompare(b.name);
    return 0;
  });

  const filteredProducts = sortedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = product.category === activeCategory;
    const matchesTag = selectedTagFilter === 'Todos' || product.tag === selectedTagFilter;

    return matchesSearch && matchesCategory && matchesTag;
  });

  const filteredOrders = orders.filter(order => {
    if (selectedOrderTrackingFilter === 'Todos') return true;
    return order.status === selectedOrderTrackingFilter;
  });

  // Pricing values
  const currentTable = tables.find(t => t.id === activeTableId) || {};
  const currentCartList = tableCarts[activeTableId] || [];
  const cartSubtotal = currentCartList.reduce((acc, item) => acc + item.calculatedPrice, 0);
  const cartDiscountAmount = cartSubtotal * (discountPercent / 100);
  const cartTax = parseFloat(((cartSubtotal - cartDiscountAmount) * 0.16).toFixed(2));
  const cartTotal = parseFloat(((cartSubtotal - cartDiscountAmount) + cartTax).toFixed(2));

  const billingTable = tables.find(t => t.id === billingTableId) || {};
  const billingSubtotal = billingTable.totalAccount || 0;
  const activeTipPercentage = customTip ? 0 : tipPercentage;
  const calculatedTipAmount = customTip ? parseFloat(customTip) || 0 : parseFloat((billingSubtotal * (activeTipPercentage / 100)).toFixed(2));
  const billingTotalToPay = parseFloat((billingSubtotal + calculatedTipAmount).toFixed(2));

  // HSL Liquid Glass Palette
  const colors = {
    primary: '#2D1E16',
    secondary: '#8D6E63',
    accent: '#D7CCC8',
    bg: darkMode ? '#121212' : '#F9F8F6',
    cardBg: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',
    textMain: darkMode ? '#ffffff' : '#1C1C1E',
    textMuted: darkMode ? '#a1a1a5' : '#8E8E93',
    border: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(45, 30, 22, 0.08)',
    success: '#4E8D70',
    danger: '#D9534F',
    warning: '#F0AD4E',
    info: '#5BC0DE',
  };

  const handleTableTap = (table) => {
    setSelectedTableForDrawer(table);
    setActiveTableId(table.id);
    setIsTableDetailDrawerVisible(true);
  };

  const renderHeader = (title, subtitle, showBack = false, customRightBtn = null) => {
    return (
      <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleGroup}>
            {showBack ? (
              <TouchableOpacity style={styles.backButton} onPress={() => {
                if (currentScreen === 'recovery') setCurrentScreen('login');
                else if (currentScreen === 'menu') setCurrentScreen('mesas');
                else if (currentScreen === 'customization') setCurrentScreen('menu');
                else if (currentScreen === 'summary') setCurrentScreen('menu');
                else if (currentScreen === 'edit_profile') setCurrentScreen('config');
                else if (currentScreen === 'details') setCurrentScreen('tracking');
                else if (currentScreen === 'statistics' || currentScreen === 'notifications_history') setCurrentScreen('config');
                else setCurrentScreen('mesas');
              }}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuButton} onPress={() => toggleSidebar(true)}>
                <Text style={styles.menuButtonText}>☰</Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.headerTitle, { color: '#ffffff' }]}>{title}</Text>
          </View>
          {customRightBtn}
        </View>
        {subtitle && <Text style={[styles.headerSubtitle, { color: colors.accent }]}>{subtitle}</Text>}
      </View>
    );
  };

  const renderFooter = (activeTab) => {
    return (
      <View style={[styles.footerContainer, { backgroundColor: colors.cardBg, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.footerTab} onPress={() => setCurrentScreen('mesas')}>
          <Text style={[styles.footerIcon, activeTab === 'mesas' && { color: colors.primary }]}>🏠</Text>
          <Text style={[styles.footerLabel, { color: activeTab === 'mesas' ? colors.primary : colors.textMuted }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab} onPress={() => setCurrentScreen('menu')}>
          <Text style={[styles.footerIcon, activeTab === 'menu' && { color: colors.primary }]}>🍔</Text>
          <Text style={[styles.footerLabel, { color: activeTab === 'menu' ? colors.primary : colors.textMuted }]}>Menú</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab} onPress={() => setCurrentScreen('tracking')}>
          <Text style={[styles.footerIcon, activeTab === 'tracking' && { color: colors.primary }]}>📦</Text>
          <Text style={[styles.footerLabel, { color: activeTab === 'tracking' ? colors.primary : colors.textMuted }]}>Pedidos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab} onPress={() => setCurrentScreen('config')}>
          <Text style={[styles.footerIcon, activeTab === 'config' && { color: colors.primary }]}>⚙️</Text>
          <Text style={[styles.footerLabel, { color: activeTab === 'config' ? colors.primary : colors.textMuted }]}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }]}>
      <View style={[styles.appContainer, { backgroundColor: colors.bg }]}>
        <StatusBar style="light" />

        {/* --- FLOATING NOTIFICATION --- */}
        <Animated.View style={[styles.notificationBanner, { transform: [{ translateY: notificationAnim }], backgroundColor: colors.primary }]}>
          <Text style={styles.notificationEmoji}>🔔</Text>
          <Text style={styles.notificationText} numberOfLines={2}>
            {kitchenNotification || ''}
          </Text>
        </Animated.View>

        {/* --- SCREEN: LOGIN --- */}
        {currentScreen === 'login' && (
          <FadeInView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.authScroll}>
              <View style={[styles.logoContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={styles.logoText}>☕</Text>
              </View>
              <Text style={[styles.appTitleText, { color: colors.primary }]}>CoffeeFlow Pro</Text>
              <Text style={[styles.appSubtitleText, { color: colors.textMuted }]}>Modulo de Comandas & Surtido</Text>

              <View style={styles.formCard}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>ID de Mesero / Correo</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                    placeholder="Ej. alberto.luna"
                    placeholderTextColor={colors.textMuted}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Contraseña de Acceso</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                    placeholder="Cualquier contraseña"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.primary }]}
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.btnText}>Iniciar Sesión</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.linksContainer} onPress={() => setCurrentScreen('recovery')}>
                  <Text style={[styles.linksText, { color: colors.secondary }]}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                {onBack && (
                  <TouchableOpacity style={styles.linksContainer} onPress={onBack}>
                    <Text style={[styles.linksText, { color: colors.textMuted }]}>← Volver al menú de módulos</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </FadeInView>
        )}

        {/* --- SCREEN: RECOVERY --- */}
        {currentScreen === 'recovery' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Recuperar', 'Recuperación de credenciales', true)}
            <View style={styles.contentContainer}>
              <View style={styles.formCard}>
                <Text style={[styles.infoParagraph, { color: colors.textMuted }]}>
                  Introduce tu correo registrado para enviarte un token temporal.
                </Text>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Correo electrónico registrado</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                    placeholder="Ej. alberto.luna@coffeeflow.com"
                    placeholderTextColor={colors.textMuted}
                    value={recoveryEmail}
                    onChangeText={setRecoveryEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleRecovery}>
                  <Text style={styles.btnText}>Enviar código temporal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </FadeInView>
        )}

        {/* --- SCREEN: ASIGNAR MESA (MAPA DE MESAS INTERACTIVO / SPATIAL MAP) --- */}
        {currentScreen === 'mesas' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('CoffeeFlow • Panel de Mesero', `Bienvenido, ${currentUser?.name || 'Alberto'}`)}

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>

              {/* TWO GIANTS BUTTONS FOR FIRST-DAY WAITER */}
              <View style={{ gap: 12, marginBottom: 20 }}>
                <ScaleInButton
                  style={{
                    backgroundColor: colors.success,
                    borderRadius: 16,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 4
                  }}
                  onPress={() => {
                    setWizardPartyCount(2);
                    setShowReceptionWizard(true);
                  }}
                >
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 12 }}>
                    <Text style={{ fontSize: 28 }}>👥</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }}>
                      Registrar Clientes Nuevos
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                      Asignar mesa libre y tomar pedido paso a paso.
                    </Text>
                  </View>
                </ScaleInButton>

                <ScaleInButton
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 16,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 4
                  }}
                  onPress={() => {
                    triggerAlertNotification("Desliza hacia abajo para ver las mesas activas 🛋️");
                  }}
                >
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 12 }}>
                    <Text style={{ fontSize: 28 }}>☕</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }}>
                      Atender Mesas Ocupadas
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                      Agregar más productos o cobrar cuentas activas.
                    </Text>
                  </View>
                </ScaleInButton>
              </View>

              <View style={styles.divider} />

              {/* SIMPLIFIED ACTIVE TABLES LIST */}
              <Text style={[styles.sectionTitle, { color: colors.secondary, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }]}>
                🛋️ Lista de Mesas Activas (En Servicio)
              </Text>

              {tables.filter(t => t.status === 'busy' || t.status === 'reserved').length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: 'bold' }}>
                    No hay mesas activas en este momento.
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                    Registra clientes nuevos con el botón verde de arriba para comenzar.
                  </Text>
                </View>
              ) : (
                tables.filter(t => t.status === 'busy' || t.status === 'reserved').map(table => {
                  const isReserved = table.status === 'reserved';
                  return (
                    <View
                      key={table.id}
                      style={[
                        styles.card,
                        {
                          backgroundColor: colors.cardBg,
                          borderColor: isReserved ? colors.warning : '#8D6E63',
                          borderWidth: 1.5,
                          padding: 16,
                          marginBottom: 12
                        }
                      ]}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textMain }}>
                            {table.name}
                          </Text>
                          <View style={{ backgroundColor: isReserved ? 'rgba(240, 173, 78, 0.15)' : 'rgba(141, 110, 99, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: isReserved ? '#e68600' : '#8D6E63' }}>
                              {isReserved ? 'Reservada' : 'En Servicio'}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                          📍 Zona: {table.zone}
                        </Text>
                      </View>

                      {isReserved ? (
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ color: colors.textMain, fontSize: 13 }}>
                            👤 Reserva para: <Text style={{ fontWeight: 'bold' }}>{table.reservedFor}</Text>
                          </Text>
                          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                            Hora: {table.time} ({table.note})
                          </Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <View>
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                              Comensales: {table.occupants}
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                              Tiempo: {table.waitTime}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                              Cuenta Acumulada
                            </Text>
                            <Text style={{ color: '#8D6E63', fontWeight: 'bold', fontSize: 18, marginTop: 2 }}>
                              ${table.totalAccount?.toFixed(2)} MXN
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Direct waiter action buttons */}
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {isReserved ? (
                          <ScaleInButton
                            style={[styles.btn, { flex: 1, backgroundColor: colors.success, marginTop: 0 }]}
                            onPress={() => {
                              setTables(prevTables =>
                                prevTables.map(t => (t.id === table.id ? { ...t, status: 'busy', occupants: `2/${t.capacity}`, totalAccount: 0 } : t))
                              );
                              setActiveTableId(table.id);
                              setPartyCount(2);
                              setActiveTablesCount(prev => prev + 1);
                              setCurrentScreen('menu');
                              triggerAlertNotification(`📍 ${table.name} asignada a clientes.`);
                            }}
                          >
                            <Text style={styles.btnText}>👥 Recibir Clientes</Text>
                          </ScaleInButton>
                        ) : (
                          <>
                            <ScaleInButton
                              style={[styles.btn, { flex: 1, backgroundColor: colors.success, marginTop: 0, paddingVertical: 12 }]}
                              onPress={() => {
                                setActiveTableId(table.id);
                                setCurrentScreen('menu');
                              }}
                            >
                              <Text style={styles.btnText}>➕ Agregar Productos</Text>
                            </ScaleInButton>

                            <ScaleInButton
                              style={[styles.btn, { flex: 1, backgroundColor: '#8D6E63', marginTop: 0, paddingVertical: 12 }]}
                              onPress={() => {
                                setBillingTableId(table.id);
                                setCurrentScreen('close_account');
                              }}
                            >
                              <Text style={styles.btnText}>🧾 Cobrar Cuenta</Text>
                            </ScaleInButton>
                          </>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {renderFooter('mesas')}
          </FadeInView>
        )}

        {/* --- SCREEN: MENU / CATALOG WITH SEARCH & SORTING --- */}
        {currentScreen === 'menu' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Catálogo Menú', `Mesa ${currentTable?.id || activeTableId} seleccionada`, true, (
              <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('summary')}>
                <Text style={{ color: '#ffffff', fontSize: 18 }}>🛒</Text>
                {currentCartList.length > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{currentCartList.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.contentContainer}>
              {/* ACTIVE TABLE BANNER - STEP 3 */}
              <View style={[styles.dashboardCard, { backgroundColor: colors.primary, marginBottom: 12, paddingVertical: 12, paddingHorizontal: 16 }]}>
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>
                  📋 Paso 3: Registra el pedido para la MESA {currentTable?.id || activeTableId}
                </Text>
              </View>

              <View style={[styles.searchBarContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={{ fontSize: 16 }}>🔍</Text>
                <TextInput
                  style={[styles.searchBarInput, { color: colors.textMain }]}
                  placeholder="Buscar en menú..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContainer}>
                  {['Todos', 'Popular', 'Clásico', 'Vegano', 'Saludable'].map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagFilterChip,
                        { borderColor: colors.border, backgroundColor: colors.bg },
                        selectedTagFilter === tag && { backgroundColor: colors.secondary, borderColor: colors.secondary }
                      ]}
                      onPress={() => setSelectedTagFilter(tag)}
                    >
                      <Text style={[styles.tagFilterText, { color: colors.textMuted }, selectedTagFilter === tag && { color: '#ffffff' }]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, paddingVertical: 6 }]}
                  onPress={() => {
                    const options = ['Default', 'PriceAsc', 'PriceDesc', 'NameAsc'];
                    const nextIndex = (options.indexOf(menuSortOption) + 1) % options.length;
                    setMenuSortOption(options[nextIndex]);
                  }}
                >
                  <Text style={{ fontSize: 11, color: colors.textMain }}>
                    🔀 Orden: {menuSortOption === 'PriceAsc' ? '$ Menor' : menuSortOption === 'PriceDesc' ? '$ Mayor' : menuSortOption === 'NameAsc' ? 'A-Z' : 'Fila'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Main Categories */}
              <View style={{ height: 48, marginBottom: 12 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContainer}>
                  {['Bebidas Calientes', 'Frías', 'Postres', 'Desayunos'].map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        { borderColor: colors.border, backgroundColor: colors.cardBg },
                        activeCategory === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setActiveCategory(cat)}
                    >
                      <Text style={[styles.chipText, { color: colors.textMuted }, activeCategory === cat && { color: '#ffffff' }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Products List */}
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {filteredProducts.map(product => (
                  <View key={product.id} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    <View style={styles.productRow}>
                      <Image source={{ uri: product.image }} style={styles.productImage} />
                      <View style={styles.productInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[styles.productName, { color: colors.textMain }]}>{product.name}</Text>
                          <View style={[styles.tagBadge, { backgroundColor: colors.accent + '33' }]}>
                            <Text style={[styles.tagBadgeText, { color: colors.primary }]}>{product.tag}</Text>
                          </View>
                        </View>
                        <Text style={[styles.productPrice, { color: colors.primary }]}>${product.price} MXN</Text>
                        <Text style={[styles.productDescription, { color: colors.textMuted }]} numberOfLines={2}>
                          {product.ingredients}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>⏱ Prep: {product.time}</Text>
                      </View>
                    </View>

                    {/* Action buttons row */}
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                      <ScaleInButton
                        style={[styles.btn, { flex: 1.3, backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1, marginTop: 0 }]}
                        onPress={() => handleCustomizeProduct(product)}
                      >
                        <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13, textAlign: 'center' }}>⚙️ Personalizar</Text>
                      </ScaleInButton>

                      {getProductQtyInCart(product.id) > 0 ? (
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', borderRadius: 8, borderWidth: 1, borderColor: colors.primary + '30', height: 44 }}>
                          <TouchableOpacity
                            style={{ padding: 10, flex: 1, alignItems: 'center' }}
                            onPress={() => handleQuickRemove(product)}
                          >
                            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>-</Text>
                          </TouchableOpacity>
                          <Text style={{ color: colors.textMain, fontWeight: 'bold', fontSize: 14 }}>{getProductQtyInCart(product.id)}</Text>
                          <TouchableOpacity
                            style={{ padding: 10, flex: 1, alignItems: 'center' }}
                            onPress={() => handleQuickAdd(product)}
                          >
                            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <ScaleInButton
                          style={[styles.btn, { flex: 1, backgroundColor: colors.primary, marginTop: 0 }]}
                          onPress={() => handleQuickAdd(product)}
                        >
                          <Text style={[styles.btnText, { fontSize: 13 }]}>⚡ Agregar</Text>
                        </ScaleInButton>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {currentCartList.length > 0 && (
              <View style={[styles.floatingCartPanel, { backgroundColor: colors.cardBg, borderTopColor: colors.border, borderTopWidth: 1 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: colors.textMain, fontWeight: 'bold', fontSize: 14 }}>
                      🛒 Carrito ({currentCartList.reduce((acc, item) => acc + item.qty, 0)} items)
                    </Text>
                    <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 13, marginTop: 2 }}>
                      Total: ${cartSubtotal} MXN
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: colors.success, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }]}
                    onPress={() => setCurrentScreen('summary')}
                  >
                    <Text style={[styles.btnText, { fontSize: 13, fontWeight: 'bold' }]}>
                      Ver Resumen ➡️
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {renderFooter('menu')}
          </FadeInView>
        )}

        {/* --- SCREEN: CUSTOMIZATION --- */}
        {currentScreen === 'customization' && customizingProduct && (
          <FadeInView style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
              <View style={styles.heroImageContainer}>
                <Image source={{ uri: customizingProduct.image }} style={styles.heroImage} />
                <TouchableOpacity
                  style={[styles.floatingBack, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                  onPress={() => setCurrentScreen('menu')}
                >
                  <Text style={{ color: '#ffffff', fontSize: 18 }}>←</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.customizationDetails, { backgroundColor: colors.bg }]}>
                <View style={styles.customizationHeader}>
                  <Text style={[styles.customizationTitle, { color: colors.textMain }]}>{customizingProduct.name}</Text>
                  <Text style={[styles.customizationPriceText, { color: colors.primary }]}>+${customizingProduct.price}</Text>
                </View>
                <Text style={[styles.customizationDesc, { color: colors.textMuted }]}>{customizingProduct.ingredients}</Text>

                <Text style={[styles.sectionTitle, { color: colors.secondary, marginTop: 20 }]}>Tipo de Leche</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
                  {['Entera', 'Deslactosada', 'Avena'].map(milk => (
                    <TouchableOpacity
                      key={milk}
                      style={[
                        styles.tagFilterChip,
                        { flex: 1, paddingVertical: 12, alignItems: 'center', borderColor: colors.border, backgroundColor: colors.cardBg, borderWidth: 1 },
                        selectedMilk === milk && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSelectedMilk(milk)}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 13, color: selectedMilk === milk ? '#ffffff' : colors.textMain }}>
                        {milk}
                      </Text>
                      {milk === 'Avena' && (
                        <Text style={{ fontSize: 10, color: selectedMilk === milk ? '#ffffff' : colors.primary }}>
                          +$15 MXN
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Extras</Text>
                <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingVertical: 4 }]}>
                  <TouchableOpacity
                    style={[styles.optionRow, { borderBottomColor: colors.border }]}
                    onPress={() => setExtraShot(!extraShot)}
                  >
                    <Text style={[styles.optionLabel, { color: colors.textMain }]}>
                      Extra Shot <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>+$12</Text>
                    </Text>
                    <View style={[styles.checkboxOutline, { borderColor: colors.border }, extraShot && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                      {extraShot && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => setSyrupVanilla(!syrupVanilla)}
                  >
                    <Text style={[styles.optionLabel, { color: colors.textMain }]}>
                      Sirope Vainilla <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>+$10</Text>
                    </Text>
                    <View style={[styles.checkboxOutline, { borderColor: colors.border }, syrupVanilla && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                      {syrupVanilla && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Observaciones Especiales / Alérgenos</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                  placeholder="Ej. Bien caliente, sin azúcar..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  value={specialNotes}
                  onChangeText={setSpecialNotes}
                />
              </View>
            </ScrollView>

            <View style={[styles.bottomActionBar, { backgroundColor: colors.cardBg, borderTopColor: colors.border }]}>
              <View style={styles.stepperActions}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.bg }]}
                  onPress={() => setCustomQty(Math.max(1, customQty - 1))}
                >
                  <Text style={[styles.stepperBtnText, { color: colors.primary }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.stepperValue, { color: colors.textMain }]}>{customQty}</Text>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.bg }]}
                  onPress={() => setCustomQty(customQty + 1)}
                >
                  <Text style={[styles.stepperBtnText, { color: colors.primary }]}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.btn, { flex: 1, marginTop: 0, backgroundColor: colors.primary }]} onPress={handleAddToCart}>
                <Text style={styles.btnText}>Agregar - ${calculateCustomizedPrice().toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>
        )}

        {/* --- SCREEN: ORDER SUMMARY --- */}
        {currentScreen === 'summary' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Comanda / Mesa ' + activeTableId, `${partyCount} personas`, true)}

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              {/* STEP 4 GUIDED BANNER */}
              <View style={[styles.dashboardCard, { backgroundColor: colors.success, marginBottom: 12, paddingVertical: 12, paddingHorizontal: 16 }]}>
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>
                  🔊 Paso 4: Confirma la orden antes de enviarla
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.cardHeaderTitle, { color: colors.textMain, borderBottomColor: colors.border }]}>
                  Productos Comanda ({currentCartList.reduce((acc, item) => acc + item.qty, 0)})
                </Text>

                {currentCartList.length === 0 ? (
                  <View style={{ paddingVertical: 32 }}>
                    <Text style={[styles.emptyCartText, { color: colors.textMuted }]}>La comanda está vacía.</Text>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, alignSelf: 'center', width: '60%' }]} onPress={() => setCurrentScreen('menu')}>
                      <Text style={styles.btnText}>Ir al Menú</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  currentCartList.map((item, idx) => (
                    <View key={idx} style={[styles.cartItemRow, { borderBottomColor: colors.border }]}>
                      <Image source={{ uri: item.product.image }} style={styles.cartThumb} />
                      <View style={styles.cartDetails}>
                        <Text style={[styles.cartItemName, { color: colors.textMain }]}>{item.product.name}</Text>
                        <Text style={[styles.cartItemMods, { color: colors.textMuted }]}>
                          Leche: {item.milk}{item.extraShot ? ', Extra Shot' : ''}{item.syrupVanilla ? ', Vainilla' : ''}
                          {item.notes ? `\n"${item.notes}"` : ''}
                        </Text>

                        <View style={styles.cartPriceStepper}>
                          <Text style={[styles.cartPriceText, { color: colors.primary }]}>${item.calculatedPrice.toFixed(2)}</Text>
                          <View style={styles.stepperActions}>
                            <TouchableOpacity
                              style={[styles.stepperBtnSmall, { backgroundColor: colors.bg }]}
                              onPress={() => {
                                setTableCarts(prev => {
                                  const list = [...prev[activeTableId]];
                                  const updatedItem = { ...list[idx] };
                                  if (updatedItem.qty > 1) {
                                    updatedItem.qty -= 1;
                                    updatedItem.calculatedPrice = (updatedItem.calculatedPrice / (updatedItem.qty + 1)) * updatedItem.qty;
                                    list[idx] = updatedItem;
                                  } else {
                                    list.splice(idx, 1);
                                  }
                                  return { ...prev, [activeTableId]: list };
                                });
                              }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>-</Text>
                            </TouchableOpacity>
                            <Text style={[styles.stepperValText, { color: colors.textMain }]}>{item.qty}</Text>
                            <TouchableOpacity
                              style={[styles.stepperBtnSmall, { backgroundColor: colors.bg }]}
                              onPress={() => {
                                setTableCarts(prev => {
                                  const list = [...prev[activeTableId]];
                                  const updatedItem = { ...list[idx] };
                                  updatedItem.qty += 1;
                                  updatedItem.calculatedPrice = (updatedItem.calculatedPrice / (updatedItem.qty - 1)) * updatedItem.qty;
                                  list[idx] = updatedItem;
                                  return { ...prev, [activeTableId]: list };
                                });
                              }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {currentCartList.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Descuento / Cortesía</Text>
                  <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    <View style={styles.chipGroupRow}>
                      {[0, 5, 10, 15, 20].map(pct => (
                        <TouchableOpacity
                          key={pct}
                          style={[
                            styles.tipChip,
                            { backgroundColor: colors.bg, borderColor: colors.border },
                            discountPercent === pct && { backgroundColor: colors.secondary, borderColor: colors.secondary }
                          ]}
                          onPress={() => setDiscountPercent(pct)}
                        >
                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: discountPercent === pct ? '#ffffff' : colors.textMuted }}>
                            {pct === 0 ? 'Ninguno' : `${pct}%`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {discountPercent > 0 && (
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.bg, color: colors.textMain, borderColor: colors.border, marginTop: 12 }]}
                        placeholder="Motivo del descuento (ej: Cliente VIP)"
                        placeholderTextColor={colors.textMuted}
                        value={discountReason}
                        onChangeText={setDiscountReason}
                      />
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1, borderStyle: 'dashed', marginBottom: 20 }]}
                    onPress={() => setCurrentScreen('menu')}
                  >
                    <Text style={{ color: colors.textMuted, fontWeight: '600', textAlign: 'center' }}>+ Añadir más productos a la Mesa</Text>
                  </TouchableOpacity>

                  <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    <View style={styles.receiptRow}>
                      <Text style={{ color: colors.textMuted }}>Subtotal</Text>
                      <Text style={{ color: colors.textMain }}>${cartSubtotal.toFixed(2)}</Text>
                    </View>
                    {discountPercent > 0 && (
                      <View style={styles.receiptRow}>
                        <Text style={{ color: colors.danger }}>Descuento ({discountPercent}%)</Text>
                        <Text style={{ color: colors.danger }}>-${cartDiscountAmount.toFixed(2)}</Text>
                      </View>
                    )}
                    <View style={styles.receiptRow}>
                      <Text style={{ color: colors.textMuted }}>IVA (16%)</Text>
                      <Text style={{ color: colors.textMain }}>${cartTax.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.receiptRowTotal, { borderTopColor: colors.border }]}>
                      <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Total Comanda</Text>
                      <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>${cartTotal.toFixed(2)} MXN</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.primary, marginBottom: 40 }]}
                    onPress={handleConfirmOrder}
                    disabled={isSendingOrder}
                  >
                    {isSendingOrder ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.btnText}>Enviar Pedido a Cocina 🍳</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </FadeInView>
        )}

        {/* --- SCREEN: ORDERS LIST / TRACKING --- */}
        {currentScreen === 'tracking' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Mis Comandas', 'Seguimiento de pedidos activos', true)}

            <View style={styles.contentContainer}>
              <View style={{ height: 42, marginBottom: 12 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContainer}>
                  {[
                    { label: 'Todas', value: 'Todos' },
                    { label: 'Pendientes', value: 'pending' },
                    { label: 'En Cocina', value: 'progress' },
                    { label: 'Listas', value: 'ready' },
                    { label: 'Entregadas', value: 'delivered' }
                  ].map(status => (
                    <TouchableOpacity
                      key={status.value}
                      style={[
                        styles.filterChip,
                        { borderColor: colors.border, backgroundColor: colors.cardBg },
                        selectedOrderTrackingFilter === status.value && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSelectedOrderTrackingFilter(status.value)}
                    >
                      <Text style={[styles.chipText, { color: colors.textMuted }, selectedOrderTrackingFilter === status.value && { color: '#ffffff' }]}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {filteredOrders.length === 0 ? (
                  <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, padding: 24, alignItems: 'center' }]}>
                    <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No hay comandas activas en este estado.</Text>
                  </View>
                ) : (
                  filteredOrders.map(order => {
                    let badgeColor = colors.warning;
                    let badgeText = 'Pendiente';
                    if (order.status === 'progress') {
                      badgeColor = colors.info;
                      badgeText = 'En Preparación';
                    } else if (order.status === 'ready') {
                      badgeColor = colors.success;
                      badgeText = 'Listo';
                    } else if (order.status === 'delivered') {
                      badgeColor = '#6c5ce7';
                      badgeText = 'Entregado';
                    }

                    return (
                      <TouchableOpacity
                        key={order.id}
                        style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                        onPress={() => {
                          setSelectedTrackingOrderId(order.id);
                          setCurrentScreen('details');
                        }}
                      >
                        <View style={styles.tableHeaderFlex}>
                          <Text style={[styles.cardTitleText, { color: colors.textMain }]}>Pedido #{order.id}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                            <Text style={[styles.statusBadgeText, { color: '#ffffff' }]}>{badgeText}</Text>
                          </View>
                        </View>
                        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>
                          {order.tableName} • {order.itemsCount} artículo(s)
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                          Comanda registrada a las {order.timeStamp}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>

            {renderFooter('tracking')}
          </FadeInView>
        )}

        {/* --- SCREEN: ORDER DETAILS --- */}
        {currentScreen === 'details' && (
          <FadeInView style={{ flex: 1 }}>
            {(() => {
              const trackingOrder = orders.find(o => o.id === selectedTrackingOrderId) || {};
              let badgeColor = colors.info;
              let badgeText = 'En Preparación';
              if (trackingOrder.status === 'pending') {
                badgeColor = colors.warning;
                badgeText = 'Pendiente';
              } else if (trackingOrder.status === 'ready') {
                badgeColor = colors.success;
                badgeText = 'Listo';
              } else if (trackingOrder.status === 'delivered') {
                badgeColor = '#6c5ce7';
                badgeText = 'Entregado';
              }

              return (
                <View style={{ flex: 1 }}>
                  {renderHeader(
                    `Pedido #${trackingOrder.id}`,
                    `${trackingOrder.tableName} • Mesa activa`,
                    true,
                    <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                      <Text style={[styles.statusBadgeText, { color: '#ffffff' }]}>{badgeText}</Text>
                    </View>
                  )}

                  <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Simular Progreso Cocina</Text>
                    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, flexDirection: 'row', gap: 8, justifyContent: 'space-around' }]}>
                      <TouchableOpacity
                        style={[styles.smallBtn, { backgroundColor: colors.info }]}
                        onPress={() => {
                          setOrders(prev => prev.map(o => o.id === trackingOrder.id ? { ...o, status: 'progress' } : o));
                          triggerAlertNotification(`🍳 Pedido #${trackingOrder.id} en preparación.`);
                        }}
                      >
                        <Text style={styles.smallBtnText}>Preparando</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallBtn, { backgroundColor: colors.success }]}
                        onPress={() => {
                          setOrders(prev => prev.map(o => o.id === trackingOrder.id ? { ...o, status: 'ready' } : o));
                          triggerAlertNotification(`☕ ¡Pedido #${trackingOrder.id} está LISTO!`, 'kitchen');
                        }}
                      >
                        <Text style={styles.smallBtnText}>Listo</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Proceso en Cocina</Text>
                    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                      <View style={styles.timeline}>
                        <View style={styles.timelineItem}>
                          <View style={[styles.timelineDot, { backgroundColor: colors.success, borderColor: colors.success }]} />
                          <View style={styles.timelineContent}>
                            <Text style={[styles.timelineTitle, { color: colors.textMain }]}>Pedido recibido en Cocina</Text>
                            <Text style={[styles.timelineSubtitle, { color: colors.textMuted }]}>Comanda capturada y en fila.</Text>
                          </View>
                        </View>

                        <View style={styles.timelineItem}>
                          <View style={[
                            styles.timelineDot,
                            (trackingOrder.status === 'progress' || trackingOrder.status === 'ready' || trackingOrder.status === 'delivered') ?
                              { backgroundColor: colors.info, borderColor: colors.info } : { backgroundColor: colors.cardBg, borderColor: colors.border }
                          ]} />
                          <View style={styles.timelineContent}>
                            <Text style={[styles.timelineTitle, { color: trackingOrder.status !== 'pending' ? colors.info : colors.textMuted }]}>Preparando Platillos/Bebidas</Text>
                            <Text style={[styles.timelineSubtitle, { color: colors.textMuted }]}>El chef está procesando los ingredientes.</Text>
                          </View>
                        </View>

                        <View style={styles.timelineItem}>
                          <View style={[
                            styles.timelineDot,
                            (trackingOrder.status === 'ready' || trackingOrder.status === 'delivered') ?
                              { backgroundColor: colors.success, borderColor: colors.success } : { backgroundColor: colors.cardBg, borderColor: colors.border }
                          ]} />
                          <View style={styles.timelineContent}>
                            <Text style={[styles.timelineTitle, { color: (trackingOrder.status === 'ready' || trackingOrder.status === 'delivered') ? colors.success : colors.textMuted }]}>Listo en Barra (Para servir)</Text>
                            <Text style={[styles.timelineSubtitle, { color: colors.textMuted }]}>Comanda terminada y lista para entrega.</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Detalles de Platillos</Text>
                    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                      {trackingOrder.items ? (
                        trackingOrder.items.map((item, idx) => (
                          <View key={idx} style={styles.receiptRow}>
                            <View>
                              <Text style={{ color: colors.textMain, fontWeight: '500' }}>
                                {item.qty}x {item.product.name}
                              </Text>
                              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                                Leche: {item.milk} {item.notes ? `| "${item.notes}"` : ''}
                              </Text>
                            </View>
                            <Text style={{ color: colors.textMain, fontWeight: '500' }}>
                              ${item.calculatedPrice.toFixed(2)}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <View style={styles.receiptRow}>
                          <Text style={{ color: colors.textMain, fontWeight: '500' }}>Productos varios</Text>
                          <Text style={{ color: colors.textMain, fontWeight: '500' }}>$150.00</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.btn,
                        trackingOrder.status !== 'ready' ?
                          { backgroundColor: colors.border } : { backgroundColor: colors.success }
                      ]}
                      disabled={trackingOrder.status !== 'ready'}
                      onPress={() => {
                        setOrders(prev => prev.map(o => o.id === selectedTrackingOrderId ? { ...o, status: 'delivered' } : o));
                        Alert.alert('Comanda Entregada', 'Se ha marcado el pedido como entregado en mesa.');
                      }}
                    >
                      <Text style={[styles.btnText, trackingOrder.status !== 'ready' && { color: colors.textMuted }]}>
                        {trackingOrder.status === 'delivered' ? '✓ Pedido Entregado' : 'Marcar como Entregado en Mesa'}
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              );
            })()}
          </FadeInView>
        )}

        {/* --- SCREEN: CLOSE ACCOUNT --- */}
        {currentScreen === 'close_account' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Cerrar Cuenta', `Mesa ${billingTableId} • Cobro Rápido`, true)}

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, alignItems: 'center', paddingVertical: 24 }]}>
                <Text style={{ color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Total Consumo + IVA
                </Text>
                <Text style={{ color: colors.primary, fontSize: 42, fontWeight: 'bold', marginVertical: 8 }}>
                  ${billingSubtotal.toFixed(2)}
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Propina Sugerida</Text>
              <View style={styles.chipGroupRow}>
                {[0, 10, 15, 20].map(pct => (
                  <TouchableOpacity
                    key={pct}
                    style={[
                      styles.tipChip,
                      { backgroundColor: colors.cardBg, borderColor: colors.border },
                      tipPercentage === pct && !customTip && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => {
                      setTipPercentage(pct);
                      setCustomTip('');
                    }}
                  >
                    <Text style={[styles.tipChipText, { color: colors.textMuted }, tipPercentage === pct && !customTip && { color: '#ffffff' }]}>
                      {pct === 0 ? 'Sin propina' : `${pct}%`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Propina personalizada ($ MXN)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                  placeholder="Ej. 50"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                  value={customTip}
                  onChangeText={(val) => {
                    setCustomTip(val);
                    setTipPercentage(0);
                  }}
                />
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Método de Pago</Text>
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingVertical: 4 }]}>
                {[
                  { name: '💳 Tarjeta de Crédito/Débito', value: 'Tarjeta' },
                  { name: '💵 Efectivo en Caja', value: 'Efectivo' },
                  { name: '👥 Pago Dividido (Cuentas separadas)', value: 'Dividido' }
                ].map(method => (
                  <TouchableOpacity
                    key={method.value}
                    style={[styles.optionRow, { borderBottomColor: colors.border }]}
                    onPress={() => setPaymentMethod(method.value)}
                  >
                    <Text style={[styles.optionLabel, { color: colors.textMain }]}>{method.name}</Text>
                    <View style={[styles.radioOutline, { borderColor: colors.border }, paymentMethod === method.value && { borderColor: colors.primary }]}>
                      {paymentMethod === method.value && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {paymentMethod === 'Dividido' && (
                <View style={[styles.card, { backgroundColor: colors.accent + '22', borderColor: colors.primary }]}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 4 }}>Información de Pago Dividido</Text>
                  <Text style={{ color: colors.textMain, fontSize: 13 }}>
                    Divide la cuenta equitativamente entre los comensales de la mesa.
                  </Text>
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15, marginTop: 8 }}>
                    Costo por persona: ${(billingTotalToPay / (billingTable.occupants ? parseInt(billingTable.occupants.split('/')[0]) : 2)).toFixed(2)} MXN
                  </Text>
                </View>
              )}

              <View style={[styles.card, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                <View style={styles.receiptRow}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Subtotal + IVA</Text>
                  <Text style={{ color: '#ffffff' }}>${billingSubtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Propina {customTip ? '(Manual)' : '(' + tipPercentage + '%)'}
                  </Text>
                  <Text style={{ color: '#ffffff' }}>${calculatedTipAmount.toFixed(2)}</Text>
                </View>
                <View style={[styles.receiptRowTotal, { borderTopColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>Total a Cobrar</Text>
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }}>${billingTotalToPay.toFixed(2)} MXN</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.success, marginBottom: 40 }]}
                onPress={handleConfirmPayment}
                disabled={isPaying}
              >
                {isPaying ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.btnText}>Confirmar Pago y Liberar Mesa 🧾</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </FadeInView>
        )}

        {/* --- SCREEN: STATISTICS --- */}
        {currentScreen === 'statistics' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Mis Estadísticas', 'Rendimiento en el turno', true)}
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.cardHeaderTitle, { color: colors.textMain, borderBottomColor: colors.border }]}>
                  Resumen de Ventas Acumuladas
                </Text>
                <Text style={{ color: colors.primary, fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 12 }}>
                  ${salesTotal.toFixed(2)} MXN
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                  Total correspondiente a {completedOrdersCount} comandas finalizadas hoy.
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Ventas por Hora</Text>
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingVertical: 20 }]}>
                <View style={styles.chartContainer}>
                  {[
                    { hour: '10 AM', val: 120, height: 30 },
                    { hour: '11 AM', val: 340, height: 60 },
                    { hour: '12 PM', val: 490, height: 90 },
                    { hour: '01 PM', val: 280, height: 50 },
                    { hour: '02 PM', val: 150, height: 35 }
                  ].map(bar => (
                    <View key={bar.hour} style={styles.chartCol}>
                      <Text style={{ fontSize: 9, color: colors.textMuted, marginBottom: 4 }}>${bar.val}</Text>
                      <View style={[styles.chartBar, { height: bar.height, backgroundColor: colors.primary }]} />
                      <Text style={{ fontSize: 10, color: colors.textMain, marginTop: 6 }}>{bar.hour}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Métricas de Eficiencia</Text>
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={[styles.receiptRow, { marginVertical: 6 }]}>
                  <Text style={{ color: colors.textMuted }}>Ticket Promedio</Text>
                  <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>
                    ${(salesTotal / (completedOrdersCount || 1)).toFixed(2)} MXN
                  </Text>
                </View>
                <View style={[styles.receiptRow, { marginVertical: 6 }]}>
                  <Text style={{ color: colors.textMuted }}>Tiempo Promedio Servicio</Text>
                  <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>14 minutos</Text>
                </View>
              </View>
            </ScrollView>
          </FadeInView>
        )}

        {/* --- SCREEN: NOTIFICATIONS HISTORY --- */}
        {currentScreen === 'notifications_history' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Centro de Alertas', 'Historial de avisos de Cocina', true)}
            <View style={styles.contentContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {notificationHistory.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.card,
                      { backgroundColor: colors.cardBg, borderColor: colors.border },
                      !item.read && { borderLeftWidth: 4, borderLeftColor: colors.info }
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, color: colors.secondary, fontWeight: 'bold' }}>
                        {item.type === 'kitchen' ? '🍳 Cocina' : '⚙️ Sistema'}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>{item.time}</Text>
                    </View>
                    <Text style={{ color: colors.textMain, fontSize: 13 }}>{item.message}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary, marginTop: 12 }]}
                onPress={() => {
                  setNotificationHistory(prev => prev.map(n => ({ ...n, read: true })));
                  triggerAlertNotification('Todas las alertas marcadas como leídas.');
                }}
              >
                <Text style={styles.btnText}>Marcar todas como leídas</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>
        )}

        {/* --- SCREEN: SETTINGS --- */}
        {currentScreen === 'config' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Configuración', 'Información del mesero y turno')}

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, alignItems: 'center' }]}>
                <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                  <Text style={styles.avatarText}>
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AL'}
                  </Text>
                </View>
                <Text style={[styles.waiterName, { color: colors.textMain }]}>{currentUser?.name || 'Alberto Luna'}</Text>
                <Text style={[styles.waiterRole, { color: colors.textMuted }]}>{currentUser?.role || 'Mesero'}</Text>

                <View style={[styles.shiftBadge, { backgroundColor: clockedIn ? colors.success + '22' : colors.danger + '22' }]}>
                  <Text style={[styles.shiftBadgeText, { color: clockedIn ? colors.success : colors.danger }]}>
                    {clockedIn ? '● Turno Activo' : '● Turno Finalizado'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Panel de Turno</Text>
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.receiptRow}>
                  <Text style={{ color: colors.textMuted }}>Duración de Turno</Text>
                  <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{shiftTime}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: colors.primary, flex: 1, paddingVertical: 12 }]}
                    onPress={() => setCurrentScreen('statistics')}
                  >
                    <Text style={[styles.smallBtnText, { textAlign: 'center' }]}>📊 Ver Reportes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: colors.primary, flex: 1, paddingVertical: 12 }]}
                    onPress={() => setCurrentScreen('notifications_history')}
                  >
                    <Text style={[styles.smallBtnText, { textAlign: 'center' }]}>🔔 Alertas</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: clockedIn ? colors.danger : colors.success, marginTop: 12 }]}
                  onPress={() => {
                    setClockedIn(!clockedIn);
                    Alert.alert(
                      clockedIn ? 'Turno Finalizado' : 'Turno Iniciado',
                      clockedIn ? 'Has cerrado tu jornada.' : 'Jornada iniciada con éxito.'
                    );
                  }}
                >
                  <Text style={styles.btnText}>
                    {clockedIn ? 'Finalizar Jornada (Clock-Out)' : 'Iniciar Jornada (Clock-In)'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Preferencias</Text>
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingVertical: 4 }]}>
                <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.settingLabel, { color: colors.textMain }]}>Notificaciones de Cocina</Text>
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: colors.border, true: colors.success }}
                  />
                </View>

                <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.settingLabel, { color: colors.textMain }]}>Modo Oscuro</Text>
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: colors.border, true: colors.success }}
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: colors.textMain }]}>Sonidos del Sistema</Text>
                  <Switch
                    value={sounds}
                    onValueChange={setSounds}
                    trackColor={{ false: colors.border, true: colors.success }}
                  />
                </View>
              </View>

              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 }]} onPress={() => setCurrentScreen('edit_profile')}>
                <Text style={{ color: colors.primary, fontWeight: '600', textAlign: 'center' }}>Editar Datos Personales</Text>
              </TouchableOpacity>
            </ScrollView>

            {renderFooter('config')}
          </FadeInView>
        )}

        {/* --- SCREEN: EDIT PROFILE --- */}
        {currentScreen === 'edit_profile' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Editar Perfil', 'Configuración de datos', true)}

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <View style={[styles.avatar, { backgroundColor: colors.secondary, position: 'relative' }]}>
                  <Text style={styles.avatarText}>
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AL'}
                  </Text>
                  <TouchableOpacity style={styles.avatarCameraBtn}>
                    <Text style={{ fontSize: 14 }}>📷</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Datos Personales</Text>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Rol asignado</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.border, color: colors.textMuted, borderColor: colors.border }]}
                  value={currentUser?.role || 'Mesero'}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Nombre completo</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Correo electrónico</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Número de teléfono</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, marginTop: 12 }]} onPress={handleUpdateProfile}>
                <Text style={styles.btnText}>Guardar cambios</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.cardBg, borderColor: colors.danger, borderWidth: 1, marginTop: 12, marginBottom: 40 }]}
                onPress={handleLogout}
              >
                <Text style={{ color: colors.danger, fontWeight: '600', textAlign: 'center' }}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </ScrollView>
          </FadeInView>
        )}

        {/* --- TRANSFER & MERGE TABLE ACTIONS MODAL --- */}
        <Modal
          visible={showTableActionModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTableActionModal(false)}
        >
          <View style={styles.modalCenteredView}>
            <View style={[styles.premiumModalView, { backgroundColor: colors.cardBg }]}>
              <Text style={[styles.modalTitleText, { color: colors.textMain }]}>Transferir / Unificar Cuentas</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>
                Acción para Mesa {activeTableId}
              </Text>

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <TouchableOpacity
                  style={[styles.tipChip, { flex: 1, backgroundColor: colors.bg }, selectedTableAction === 'Transfer' && { backgroundColor: colors.primary }]}
                  onPress={() => setSelectedTableAction('Transfer')}
                >
                  <Text style={{ color: selectedTableAction === 'Transfer' ? '#ffffff' : colors.textMain, fontWeight: 'bold' }}>Mover Mesa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tipChip, { flex: 1, backgroundColor: colors.bg }, selectedTableAction === 'Merge' && { backgroundColor: colors.primary }]}
                  onPress={() => setSelectedTableAction('Merge')}
                >
                  <Text style={{ color: selectedTableAction === 'Merge' ? '#ffffff' : colors.textMain, fontWeight: 'bold' }}>Unir Cuenta</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Número de Mesa Destino</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bg, color: colors.textMain, borderColor: colors.border }]}
                  placeholder="Ej: 5"
                  keyboardType="numeric"
                  value={destinationTableId}
                  onChangeText={setDestinationTableId}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.btn, { flex: 1, backgroundColor: colors.border }]}
                  onPress={() => setShowTableActionModal(false)}
                >
                  <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { flex: 1, backgroundColor: colors.success }]}
                  onPress={executeTableAction}
                >
                  <Text style={styles.btnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* --- PREMIUM BOTTOM SHEET DRAWER FOR TABLE ACTIONS --- */}
        <Modal
          visible={isTableDetailDrawerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsTableDetailDrawerVisible(false)}
        >
          <View style={styles.bottomSheetContainer}>
            <TouchableOpacity
              style={styles.bottomSheetBackdrop}
              onPress={() => setIsTableDetailDrawerVisible(false)}
            />
            <View style={[styles.bottomSheetContent, { backgroundColor: colors.cardBg }]}>
              {/* Drag indicator handle */}
              <View style={styles.bottomSheetHandle} />

              {selectedTableForDrawer && (
                <View style={{ width: '100%', paddingVertical: 12 }}>
                  <Text style={[styles.drawerTitleText, { color: colors.textMain }]}>
                    {selectedTableForDrawer.name}
                  </Text>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 }}>
                    <View style={[styles.tagBadge, { backgroundColor: colors.primary + '15' }]}>
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
                        📍 Zona: {selectedTableForDrawer.zone}
                      </Text>
                    </View>
                    <View style={[styles.tagBadge, { backgroundColor: colors.secondary + '15' }]}>
                      <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '700' }}>
                        👥 Capacidad: {selectedTableForDrawer.capacity} comensales
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Contextual actions */}
                  {selectedTableForDrawer.status === 'available' && (
                    <View>
                      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 12 }}>
                        La mesa está libre. Selecciona el número de personas arriba si deseas cambiar la asignación por defecto.
                      </Text>
                      <TouchableOpacity
                        style={[styles.btn, { backgroundColor: colors.success }]}
                        onPress={() => handleOpenMesa(selectedTableForDrawer)}
                      >
                        <Text style={styles.btnText}>Abrir Mesa & Tomar Pedido ✏️</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedTableForDrawer.status === 'reserved' && (
                    <View>
                      <Text style={{ color: colors.textMain, fontSize: 14, fontWeight: 'bold' }}>
                        Reserva a nombre de: {selectedTableForDrawer.reservedFor}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 13, marginVertical: 6 }}>
                        Hora: {selectedTableForDrawer.time} ({selectedTableForDrawer.note})
                      </Text>
                      <TouchableOpacity
                        style={[styles.btn, { backgroundColor: colors.primary }]}
                        onPress={() => handleOpenMesa(selectedTableForDrawer)}
                      >
                        <Text style={styles.btnText}>Recibir Cliente & Iniciar Comanda 👥</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedTableForDrawer.status === 'busy' && (
                    <View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
                        <Text style={{ color: colors.textMuted }}>Ocupantes actuales:</Text>
                        <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{selectedTableForDrawer.occupants}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
                        <Text style={{ color: colors.textMuted }}>Tiempo transcurrido:</Text>
                        <Text style={{ color: colors.danger, fontWeight: 'bold' }}>{selectedTableForDrawer.waitTime}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
                        <Text style={{ color: colors.textMuted }}>Atendido por:</Text>
                        <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{selectedTableForDrawer.waiter}</Text>
                      </View>

                      <View style={[styles.card, { backgroundColor: colors.primary + '10', borderColor: colors.border, marginVertical: 12, padding: 12 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Consumo acumulado:</Text>
                          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>${selectedTableForDrawer.totalAccount?.toFixed(2)} MXN</Text>
                        </View>
                      </View>

                      <View style={{ gap: 8 }}>
                        <TouchableOpacity
                          style={[styles.btn, { backgroundColor: colors.success }]}
                          onPress={() => {
                            setActiveTableId(selectedTableForDrawer.id);
                            setIsTableDetailDrawerVisible(false);
                            setCurrentScreen('menu');
                          }}
                        >
                          <Text style={styles.btnText}>✏️ Agregar al Pedido / Menú ☕</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            style={[styles.btn, { flex: 1, backgroundColor: colors.secondary }]}
                            onPress={() => {
                              setSelectedTableAction('Transfer');
                              setShowTableActionModal(true);
                            }}
                          >
                            <Text style={styles.btnText}>🔄 Mover Cuenta</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.btn, { flex: 1, backgroundColor: colors.primary }]}
                            onPress={() => {
                              setBillingTableId(selectedTableForDrawer.id);
                              setIsTableDetailDrawerVisible(false);
                              setCurrentScreen('close_account');
                            }}
                          >
                            <Text style={styles.btnText}>🧾 Cerrar Cuenta</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.bg, marginTop: 14 }]}
                    onPress={() => setIsTableDetailDrawerVisible(false)}
                  >
                    <Text style={{ color: colors.textMain, fontWeight: 'bold', textAlign: 'center' }}>Cerrar Detalles</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* --- RECEPTION WIZARD MODAL --- */}
        <Modal
          visible={showReceptionWizard}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowReceptionWizard(false)}
        >
          <View style={styles.bottomSheetContainer}>
            <TouchableOpacity
              style={styles.bottomSheetBackdrop}
              onPress={() => setShowReceptionWizard(false)}
            />
            <View style={[styles.bottomSheetContent, { backgroundColor: colors.cardBg, maxHeight: '85%' }]}>
              <View style={styles.bottomSheetHandle} />

              <Text style={[styles.drawerTitleText, { color: colors.textMain }]}>
                👥 Recibir Clientes
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>
                Sigue el diálogo del mesero para asignar la mesa ideal.
              </Text>

              {/* STEP 1: Saludo & Mesa para cuántos */}
              <Text style={[styles.sectionTitle, { color: colors.secondary, marginTop: 4 }]}>
                1. "¿Hola, bienvenidos! ¿Mesa para cuántos?"
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.tagFilterChip,
                      { paddingVertical: 10, paddingHorizontal: 16, borderColor: colors.border, backgroundColor: colors.bg, borderWidth: 1 },
                      wizardPartyCount === num && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setWizardPartyCount(num)}
                  >
                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: wizardPartyCount === num ? '#ffffff' : colors.textMain }}>
                      {num === 8 ? '8+' : num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              {/* STEP 2: Mesas disponibles recomendadas por área */}
              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                2. Mesas Libres Recomendadas (Capacidad {wizardPartyCount}+):
              </Text>

              <ScrollView style={{ maxHeight: 250, marginVertical: 8 }} showsVerticalScrollIndicator={false}>
                {['Interior', 'Terraza', 'VIP'].map(zone => {
                  const recommendedTables = tables.filter(t =>
                    t.status === 'available' &&
                    t.zone === zone &&
                    t.capacity >= wizardPartyCount
                  );

                  if (recommendedTables.length === 0) return null;

                  return (
                    <View key={zone} style={{ marginBottom: 12 }}>
                      <Text style={{ color: colors.textMain, fontWeight: 'bold', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        📍 Zona: {zone}
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {recommendedTables.map(table => (
                          <TouchableOpacity
                            key={table.id}
                            style={{
                              padding: 12,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: colors.success + '40',
                              backgroundColor: colors.success + '10',
                              minWidth: 80,
                              alignItems: 'center'
                            }}
                            onPress={() => {
                              setTables(prevTables =>
                                prevTables.map(t => (t.id === table.id ? { ...t, status: 'busy', occupants: `${wizardPartyCount}/${t.capacity}`, totalAccount: 0 } : t))
                              );
                              setActiveTableId(table.id);
                              setPartyCount(wizardPartyCount);
                              setActiveTablesCount(prev => prev + 1);
                              setShowReceptionWizard(false);
                              setCurrentScreen('menu');
                              triggerAlertNotification(`📍 ${table.name} asignada a ${wizardPartyCount} personas.`);
                            }}
                          >
                            <Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 14 }}>
                              {table.name}
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
                              Cap: {table.capacity} p.
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  );
                })}

                {tables.filter(t => t.status === 'available' && t.capacity >= wizardPartyCount).length === 0 && (
                  <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                    <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 13 }}>
                      ⚠️ No hay mesas disponibles con esa capacidad.
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4, textAlign: 'center' }}>
                      Libera alguna mesa ocupada o selecciona una cantidad menor de personas para ver otras opciones.
                    </Text>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.bg, marginTop: 14 }]}
                onPress={() => setShowReceptionWizard(false)}
              >
                <Text style={{ color: colors.textMain, fontWeight: 'bold', textAlign: 'center' }}>
                  Cancelar Recepción
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* --- SIDEBAR DRAWER MODAL --- */}
        <Modal
          visible={sidebarOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => toggleSidebar(false)}
        >
          <View style={styles.sidebarModalOverlay}>
            <Animated.View style={[styles.sidebarMenu, { backgroundColor: colors.primary, transform: [{ translateX: sidebarAnim }] }]}>
              <Text style={styles.sidebarHeader}>☕ CoffeeFlow Pro</Text>

              <View style={styles.sidebarSectionDivider} />

              <TouchableOpacity style={styles.sidebarLink} onPress={() => { toggleSidebar(false); setCurrentScreen('mesas'); }}>
                <Text style={styles.sidebarLinkLabel}>🏠 Inicio / Control Mesas</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarLink} onPress={() => { toggleSidebar(false); setCurrentScreen('menu'); }}>
                <Text style={styles.sidebarLinkLabel}>🍔 Catálogo de Menú</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarLink} onPress={() => { toggleSidebar(false); setCurrentScreen('tracking'); }}>
                <Text style={styles.sidebarLinkLabel}>📦 Seguimiento Cocina</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarLink} onPress={() => {
                toggleSidebar(false);
                setBillingTableId(4);
                setCurrentScreen('close_account');
              }}>
                <Text style={styles.sidebarLinkLabel}>🧾 Cobro Rápido</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarLink} onPress={() => { toggleSidebar(false); setCurrentScreen('statistics'); }}>
                <Text style={styles.sidebarLinkLabel}>📊 Reportes de Ventas</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarLink} onPress={() => { toggleSidebar(false); setCurrentScreen('config'); }}>
                <Text style={styles.sidebarLinkLabel}>⚙️ Ajustes y Turno</Text>
              </TouchableOpacity>

              <View style={styles.sidebarFooter}>
                <TouchableOpacity style={styles.sidebarLogoutBtn} onPress={handleLogout}>
                  <Text style={styles.sidebarLogoutBtnText}>🚪 Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <TouchableOpacity
              style={styles.sidebarCloseOverlay}
              onPress={() => toggleSidebar(false)}
            />
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  appContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  menuButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.8,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
  },
  footerTab: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  footerIcon: {
    fontSize: 20,
    color: '#86868b',
    marginBottom: 2,
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 44,
  },
  appTitleText: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  appSubtitleText: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
  },
  formGroup: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
    height: 80,
    textAlignVertical: 'top',
  },
  btn: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  linksText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipScrollContainer: {
    paddingLeft: 4,
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  stepperLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepperActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginVertical: 12,
    marginLeft: 4,
  },
  tableCard: {
    borderRadius: 20,
    padding: 18,
    paddingLeft: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  tableHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableNameText: {
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  detailItemText: {
    width: '47%',
    fontSize: 12.5,
    fontWeight: '500',
  },
  tableCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  footerStateText: {
    fontSize: 12,
  },
  smallBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  productRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  heroImageContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingBack: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customizationDetails: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
    flex: 1,
  },
  customizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customizationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  customizationPriceText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  customizationDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  radioOutline: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkboxOutline: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCheck: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  emptyCartText: {
    textAlign: 'center',
    fontSize: 14,
    marginVertical: 20,
  },
  cartItemRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  cartThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  cartDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cartItemMods: {
    fontSize: 12,
    marginBottom: 8,
  },
  cartPriceStepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartPriceText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  stepperBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValText: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 18,
    textAlign: 'center',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeline: {
    paddingLeft: 12,
    marginVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    marginTop: 2,
    zIndex: 2,
  },
  timelineContent: {
    marginLeft: 16,
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tipChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  tipChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipGroupRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  avatarCameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  waiterName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  waiterRole: {
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  sidebarModalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sidebarMenu: {
    width: 280,
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 999,
  },
  sidebarHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  sidebarSectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  sidebarLink: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sidebarLinkLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    fontWeight: '500',
  },
  sidebarFooter: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  sidebarLogoutBtn: {
    paddingVertical: 14,
  },
  sidebarLogoutBtnText: {
    color: '#ff7675',
    fontSize: 16,
    fontWeight: '700',
  },
  sidebarCloseOverlay: {
    flex: 1,
    height: '100%',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  notificationEmoji: {
    fontSize: 22,
  },
  notificationText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
    flex: 1,
  },
  dashboardCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  dashboardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dashboardStatCol: {
    alignItems: 'center',
  },
  dashboardStatVal: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  dashboardStatLabel: {
    color: '#D7CCC8',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
  },
  filterChipZone: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
  },
  filterLabelInline: {
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 12,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 15,
  },
  tagFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  tagFilterText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  shiftBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  shiftBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoParagraph: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  premiumModalView: {
    width: '85%',
    maxWidth: 360,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 20,
  },
  chartCol: {
    alignItems: 'center',
  },
  chartBar: {
    width: 24,
    borderRadius: 6,
  },
  // --- SPATIAL MAP VIEW AND DRAWERS ---
  tableGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 24,
  },
  gridTableItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  gridTableStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  gridTableName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridTableZoneText: {
    fontSize: 10.5,
    marginTop: 2,
    fontWeight: '600',
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheetBackdrop: {
    flex: 1,
  },
  bottomSheetContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E5EA',
    alignSelf: 'center',
    marginBottom: 16,
  },
  drawerTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 12,
  },
  floatingCartPanel: {
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
});
