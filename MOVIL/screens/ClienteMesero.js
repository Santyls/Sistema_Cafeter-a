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
import { Ionicons } from '@expo/vector-icons';

import { API_BASE_URL } from '../config/api';
import useTurno from './shared/useTurno';
import AvisoModal, { useAviso } from './shared/AvisoModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- EXPANDED PRODUCT CATALOG ---
const PRODUCTS = [
  {
    "id": 1,
    "name": "Café Americano",
    "price": 45,
    "category": "Bebidas Calientes",
    "ingredients": "Café de grano recién tostado de especialidad, extracción clásica.",
    "tag": "Popular",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 2,
    "name": "Capuchino Clásico",
    "price": 65,
    "category": "Bebidas Calientes",
    "ingredients": "Espresso doble con leche texturizada y espuma suave.",
    "tag": "Clásico",
    "time": "7 min",
    "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 3,
    "name": "Espresso Doble",
    "price": 55,
    "category": "Bebidas Calientes",
    "ingredients": "Extracción corta e intensa de granos seleccionados 100% Arábica.",
    "tag": "Intenso",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 4,
    "name": "Latte de Vainilla",
    "price": 70,
    "category": "Bebidas Calientes",
    "ingredients": "Espresso con leche cremosa y un toque de sirope artesanal de vainilla.",
    "tag": "Dulce",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 5,
    "name": "Espresso Macchiato",
    "price": 48,
    "category": "Bebidas Calientes",
    "ingredients": "Espresso clásico cortado con una cucharada de espuma de leche.",
    "tag": "Intenso",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1557006021-b85abd195b65?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 6,
    "name": "Flat White",
    "price": 58,
    "category": "Bebidas Calientes",
    "ingredients": "Doble shot de espresso corto con leche caliente micro-texturizada.",
    "tag": "Popular",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 7,
    "name": "Moka Caliente",
    "price": 68,
    "category": "Bebidas Calientes",
    "ingredients": "Espresso combinado con salsa de chocolate y leche vaporizada.",
    "tag": "Dulce",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 8,
    "name": "Moka Blanco Caliente",
    "price": 72,
    "category": "Bebidas Calientes",
    "ingredients": "Espresso con salsa de chocolate blanco y leche vaporizada.",
    "tag": "Dulce",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 9,
    "name": "Caramel Macchiato",
    "price": 75,
    "category": "Bebidas Calientes",
    "ingredients": "Leche vaporizada con vainilla, espresso y rejilla de caramelo.",
    "tag": "Popular",
    "time": "7 min",
    "image": "https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 10,
    "name": "Cortado de la Casa",
    "price": 50,
    "category": "Bebidas Calientes",
    "ingredients": "Proporciones iguales de espresso y leche vaporizada templada.",
    "tag": "Clásico",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 11,
    "name": "Café de Olla",
    "price": 40,
    "category": "Bebidas Calientes",
    "ingredients": "Tradicional café endulzado con piloncillo, canela y piel de naranja.",
    "tag": "Clásico",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1595434066389-021b3fd92a5b?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 12,
    "name": "Irish Coffee Especial",
    "price": 85,
    "category": "Bebidas Calientes",
    "ingredients": "Café americano caliente con whiskey irlandés y crema batida.",
    "tag": "Intenso",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 13,
    "name": "Matcha Latte Caliente",
    "price": 75,
    "category": "Bebidas Calientes",
    "ingredients": "Té matcha ceremonial disuelto en agua caliente y leche vaporizada.",
    "tag": "Saludable",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 14,
    "name": "Chai Latte Caliente",
    "price": 72,
    "category": "Bebidas Calientes",
    "ingredients": "Té negro especiado con cardamomo y canela combinado con leche vaporizada.",
    "tag": "Popular",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 15,
    "name": "Té Verde Orgánico",
    "price": 40,
    "category": "Bebidas Calientes",
    "ingredients": "Hojas seleccionadas de té verde infusionadas a temperatura controlada.",
    "tag": "Saludable",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 16,
    "name": "Té Negro English Breakfast",
    "price": 40,
    "category": "Bebidas Calientes",
    "ingredients": "Mezcla tradicional de tés negros con cuerpo robusto ideal con leche.",
    "tag": "Clásico",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 17,
    "name": "Té de Manzanilla y Miel",
    "price": 38,
    "category": "Bebidas Calientes",
    "ingredients": "Infusión relajante de flores de manzanilla con un toque de miel orgánica.",
    "tag": "Saludable",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 18,
    "name": "Té de Menta Refrescante",
    "price": 38,
    "category": "Bebidas Calientes",
    "ingredients": "Infusión digestiva elaborada con hojas naturales de menta piperita.",
    "tag": "Saludable",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 19,
    "name": "Chocolate Caliente 70%",
    "price": 55,
    "category": "Bebidas Calientes",
    "ingredients": "Chocolate de mesa mexicano hecho en casa con leche vaporizada.",
    "tag": "Dulce",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 20,
    "name": "Té Chai de Vainilla",
    "price": 75,
    "category": "Bebidas Calientes",
    "ingredients": "Té chai especiado adicionado con extracto de vainilla de Papantla.",
    "tag": "Dulce",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 21,
    "name": "Té Oolong de Especialidad",
    "price": 45,
    "category": "Bebidas Calientes",
    "ingredients": "Té azul semioxidado con perfil aromático floral y tostado.",
    "tag": "Saludable",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 22,
    "name": "Rooibos Limón",
    "price": 42,
    "category": "Bebidas Calientes",
    "ingredients": "Infusión libre de cafeína con notas cítricas e ideal para relajarse.",
    "tag": "Saludable",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 23,
    "name": "Affogato de Vainilla",
    "price": 65,
    "category": "Bebidas Calientes",
    "ingredients": "Doble shot de espresso vertido sobre una bola de helado de vainilla.",
    "tag": "Dulce",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1594911774802-8822a707cff3?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 24,
    "name": "Café Miel de Abeja",
    "price": 65,
    "category": "Bebidas Calientes",
    "ingredients": "Café espresso con leche vaporizada, canela en polvo y miel natural.",
    "tag": "Dulce",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 25,
    "name": "Golden Milk Caliente",
    "price": 70,
    "category": "Bebidas Calientes",
    "ingredients": "Bebida caliente a base de leche de almendras, cúrcuma, jengibre y canela.",
    "tag": "Vegano",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 26,
    "name": "Espresso Romano",
    "price": 42,
    "category": "Bebidas Calientes",
    "ingredients": "Shot simple de espresso de grano fino servido con una rodaja de limón.",
    "tag": "Intenso",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 27,
    "name": "London Fog",
    "price": 60,
    "category": "Bebidas Calientes",
    "ingredients": "Té Earl Grey caliente con jarabe de vainilla y espuma de leche.",
    "tag": "Clásico",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 28,
    "name": "Latte con Cajeta",
    "price": 70,
    "category": "Bebidas Calientes",
    "ingredients": "Café espresso tradicional combinado con cajeta quemada de Celaya.",
    "tag": "Dulce",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 29,
    "name": "Latte con Leche de Coco",
    "price": 72,
    "category": "Bebidas Calientes",
    "ingredients": "Café espresso de especialidad vaporizado con leche vegetal de coco.",
    "tag": "Vegano",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 30,
    "name": "Espresso con Panna",
    "price": 50,
    "category": "Bebidas Calientes",
    "ingredients": "Shot de espresso coronado con una generosa porción de crema batida.",
    "tag": "Popular",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 31,
    "name": "Té Herbal de Frutas",
    "price": 38,
    "category": "Bebidas Calientes",
    "ingredients": "Infusión caliente de manzana, fresas y bayas mixtas deshidratadas.",
    "tag": "Saludable",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 32,
    "name": "Frappé Caramelo",
    "price": 85,
    "category": "Frías",
    "ingredients": "Bebida fría frappé con jarabe de caramelo, crema batida y topping de caramelo.",
    "tag": "Popular",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 33,
    "name": "Iced Latte Avena",
    "price": 75,
    "category": "Frías",
    "ingredients": "Espresso sobre hielo con leche de avena orgánica texturizada.",
    "tag": "Vegano",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1461023058043-033481440479?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 34,
    "name": "Smoothie Frutos Rojos",
    "price": 80,
    "category": "Frías",
    "ingredients": "Mezcla cremosa de fresa, frambuesa, zarzamora y yogur natural.",
    "tag": "Saludable",
    "time": "7 min",
    "image": "https://images.unsplash.com/photo-1553530979-7ee52a2670c2?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 35,
    "name": "Cold Brew Clásico",
    "price": 62,
    "category": "Frías",
    "ingredients": "Extracción en frío reposada por 16 horas para menor acidez y gran dulzura.",
    "tag": "Intenso",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 36,
    "name": "Frappé de Oreo",
    "price": 78,
    "category": "Frías",
    "ingredients": "Bebida helada cremosa a base de leche frapeada con galletas oreo de chocolate.",
    "tag": "Popular",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 37,
    "name": "Frappé de Cajeta",
    "price": 75,
    "category": "Frías",
    "ingredients": "Frappé cremoso mezclado con cajeta quemada de Celaya y crema batida.",
    "tag": "Dulce",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 38,
    "name": "Soda Italiana Fresa",
    "price": 58,
    "category": "Frías",
    "ingredients": "Bebida refrescante con agua carbonatada y jarabe artesanal de fresa.",
    "tag": "Refrescante",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 39,
    "name": "Soda Italiana Azul",
    "price": 58,
    "category": "Frías",
    "ingredients": "Soda con jarabe artesanal curacao azul, limón y hielo picado.",
    "tag": "Refrescante",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 40,
    "name": "Agua Mineral",
    "price": 25,
    "category": "Frías",
    "ingredients": "Botella de agua mineral de manantial muy fría.",
    "tag": "Clásico",
    "time": "2 min",
    "image": "https://images.unsplash.com/photo-1608885898957-a599fb1eeef5?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 41,
    "name": "Cold Brew con Leche",
    "price": 68,
    "category": "Frías",
    "ingredients": "Cold brew premium de la casa servido con hielos y leche de tu elección.",
    "tag": "Popular",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1461023058043-033481440479?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 42,
    "name": "Smoothie de Mango",
    "price": 80,
    "category": "Frías",
    "ingredients": "Bebida helada de mango natural con yogur, menta y hielo.",
    "tag": "Refrescante",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1553530979-7ee52a2670c2?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 43,
    "name": "Smoothie de Piña y Coco",
    "price": 82,
    "category": "Frías",
    "ingredients": "Mezcla de piña fresca, crema de coco orgánica y hielo.",
    "tag": "Refrescante",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1553530979-7ee52a2670c2?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 44,
    "name": "Té Helado Durazno",
    "price": 45,
    "category": "Frías",
    "ingredients": "Té negro premium de la casa endulzado con jarabe artesanal de durazno.",
    "tag": "Refrescante",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 45,
    "name": "Té Helado Matcha",
    "price": 68,
    "category": "Frías",
    "ingredients": "Polvo matcha orgánico disuelto en agua con limón y endulzado con stevia.",
    "tag": "Saludable",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 46,
    "name": "Frappé Moka",
    "price": 78,
    "category": "Frías",
    "ingredients": "Espresso frapeado con chocolate belga, crema batida y chispas.",
    "tag": "Dulce",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 47,
    "name": "Iced Americano",
    "price": 48,
    "category": "Frías",
    "ingredients": "Café americano de espresso doble servido sobre abundantes cubos de hielo.",
    "tag": "Intenso",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 48,
    "name": "Iced Capuchino Canela",
    "price": 68,
    "category": "Frías",
    "ingredients": "Capuchino clásico con abundante espuma fría de leche y canela.",
    "tag": "Popular",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 49,
    "name": "Frappé Chai",
    "price": 82,
    "category": "Frías",
    "ingredients": "Polvo de té chai mezclado con leche, jarabe dulce, hielo y licuado.",
    "tag": "Popular",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 50,
    "name": "Soda Italiana Manzana Verde",
    "price": 58,
    "category": "Frías",
    "ingredients": "Bebida carbonatada refrescante con jarabe de manzana verde.",
    "tag": "Refrescante",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 51,
    "name": "Soda Italiana Mango",
    "price": 58,
    "category": "Frías",
    "ingredients": "Soda fría con jarabe artesanal concentrado de mango de temporada.",
    "tag": "Refrescante",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 52,
    "name": "Cold Brew Tonic",
    "price": 75,
    "category": "Frías",
    "ingredients": "Mezcla energética de cold brew reposado con agua tónica y rodaja de limón.",
    "tag": "Popular",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 53,
    "name": "Té Helado de Limón",
    "price": 40,
    "category": "Frías",
    "ingredients": "Infusión fría de té negro con rodajas frescas y exprimido de limón.",
    "tag": "Refrescante",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 54,
    "name": "Malteada de Vainilla",
    "price": 70,
    "category": "Frías",
    "ingredients": "Helado de crema de vainilla licuado con leche y crema batida.",
    "tag": "Dulce",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 55,
    "name": "Malteada de Fresa",
    "price": 70,
    "category": "Frías",
    "ingredients": "Helado cremoso de fresa licuado con leche fresca de vaca.",
    "tag": "Dulce",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 56,
    "name": "Frappé Chocolate Belga",
    "price": 78,
    "category": "Frías",
    "ingredients": "Frappé de chocolate belga triturado con leche y chips de chocolate.",
    "tag": "Popular",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 57,
    "name": "Iced Matcha con Coco",
    "price": 78,
    "category": "Frías",
    "ingredients": "Matcha de alta calidad batido sobre hielo con leche de coco fría.",
    "tag": "Vegano",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 58,
    "name": "Smoothie de Fresa y Plátano",
    "price": 75,
    "category": "Frías",
    "ingredients": "Licuado helado de fresas selectas, plátano, hielo y yogur griego.",
    "tag": "Saludable",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1553530979-7ee52a2670c2?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 59,
    "name": "Limonada Natural Fría",
    "price": 40,
    "category": "Frías",
    "ingredients": "Limonada tradicional exprimida al momento con agua fría y endulzante.",
    "tag": "Refrescante",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 60,
    "name": "Naranjada Mineral",
    "price": 45,
    "category": "Frías",
    "ingredients": "Naranjada mineral hecha con jugo natural y agua carbonatada premium.",
    "tag": "Refrescante",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1608885898957-a599fb1eeef5?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 61,
    "name": "Iced Flat White",
    "price": 58,
    "category": "Frías",
    "ingredients": "Flat white clásico vertido directo sobre hielos para refrescar tu tarde.",
    "tag": "Clásico",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 62,
    "name": "Cold Brew con Crema Dulce",
    "price": 72,
    "category": "Frías",
    "ingredients": "Cold brew filtrado en frío coronado con crema dulce texturizada.",
    "tag": "Dulce",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1461023058043-033481440479?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 63,
    "name": "Croissant Almendra",
    "price": 65,
    "category": "Postres",
    "ingredients": "Hojaldre de mantequilla crujiente relleno de crema fina de almendras.",
    "tag": "Clásico",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 64,
    "name": "Cheesecake Fresa",
    "price": 80,
    "category": "Postres",
    "ingredients": "Tarta de queso crema clásica estilo New York con coulis de fresas frescas.",
    "tag": "Dulce",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 65,
    "name": "Pastel Chocolate Amargo",
    "price": 85,
    "category": "Postres",
    "ingredients": "Bizcocho húmedo de chocolate oscuro de especialidad 70% cacao mexicano.",
    "tag": "Popular",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 66,
    "name": "Muffin de Chocolate",
    "price": 45,
    "category": "Postres",
    "ingredients": "Muffin horneado de chocolate oscuro con chispas semiamargas.",
    "tag": "Dulce",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 67,
    "name": "Muffin de Arándanos",
    "price": 45,
    "category": "Postres",
    "ingredients": "Muffin esponjoso horneado con arándanos frescos de huerto y toque de limón.",
    "tag": "Saludable",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 68,
    "name": "Cinnamon Roll",
    "price": 48,
    "category": "Postres",
    "ingredients": "Rollo de canela tibio con glaseado cremoso de queso.",
    "tag": "Popular",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 69,
    "name": "Dona Glaseada",
    "price": 28,
    "category": "Postres",
    "ingredients": "Dona clásica con glaseado transparente y textura muy esponjosa.",
    "tag": "Clásico",
    "time": "2 min",
    "image": "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 70,
    "name": "Crepa de Nutella",
    "price": 65,
    "category": "Postres",
    "ingredients": "Crepa delgada y suave rellena de crema de avellanas nutella y fresas.",
    "tag": "Dulce",
    "time": "7 min",
    "image": "https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 71,
    "name": "Waffle con Frutos",
    "price": 70,
    "category": "Postres",
    "ingredients": "Waffle crujiente de la casa con fresas, frambuesa y miel de maple.",
    "tag": "Popular",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 72,
    "name": "Tarta de Limón",
    "price": 50,
    "category": "Postres",
    "ingredients": "Tarta crujiente con crema de limón y merengue tostado.",
    "tag": "Clásico",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 73,
    "name": "Pastel Red Velvet",
    "price": 65,
    "category": "Postres",
    "ingredients": "Bizcocho rojo aterciopelado con cobertura clásica de queso crema dulce.",
    "tag": "Popular",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1616031037011-087000171abe?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 74,
    "name": "Pastel de Zanahoria",
    "price": 60,
    "category": "Postres",
    "ingredients": "Bizcocho húmedo de zanahoria, nuez picada, piña y betún de queso.",
    "tag": "Clásico",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 75,
    "name": "Tarta de Manzana",
    "price": 55,
    "category": "Postres",
    "ingredients": "Pay de manzana tradicional tibio con canela y masa crujiente.",
    "tag": "Clásico",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 76,
    "name": "Galleta de Chispas",
    "price": 30,
    "category": "Postres",
    "ingredients": "Galleta gigante de mantequilla horneada con chispas de chocolate belga.",
    "tag": "Popular",
    "time": "2 min",
    "image": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 77,
    "name": "Galleta de Avena y Pasas",
    "price": 30,
    "category": "Postres",
    "ingredients": "Galleta de avena integral horneada con pasas y un toque de canela.",
    "tag": "Saludable",
    "time": "2 min",
    "image": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 78,
    "name": "Brownie con Helado",
    "price": 55,
    "category": "Postres",
    "ingredients": "Brownie tibio de chocolate fudge con una bola de helado de vainilla.",
    "tag": "Dulce",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 79,
    "name": "Macarons Surtidos",
    "price": 60,
    "category": "Postres",
    "ingredients": "Caja con 3 macarons franceses de sabores vainilla, chocolate y fresa.",
    "tag": "Dulce",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 80,
    "name": "Tarta de Queso Frambuesa",
    "price": 82,
    "category": "Postres",
    "ingredients": "New York cheesecake cremoso bañado con salsa artesanal de frambuesas.",
    "tag": "Dulce",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 81,
    "name": "Waffle Nutella y Plátano",
    "price": 75,
    "category": "Postres",
    "ingredients": "Waffle recién horneado con rodajas de plátano y crema nutella.",
    "tag": "Popular",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 82,
    "name": "Crepa con Cajeta",
    "price": 65,
    "category": "Postres",
    "ingredients": "Crepa dulce bañada con cajeta, nuez picada y helado de vainilla.",
    "tag": "Dulce",
    "time": "7 min",
    "image": "https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 83,
    "name": "Pastel de Tres Leches",
    "price": 60,
    "category": "Postres",
    "ingredients": "Rebanada de pastel húmedo de tres leches decorado con fresas.",
    "tag": "Popular",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 84,
    "name": "Churros con Chocolate",
    "price": 45,
    "category": "Postres",
    "ingredients": "3 churros crujientes con azúcar y canela, acompañados de dip de chocolate.",
    "tag": "Clásico",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 85,
    "name": "Alfajores de Dulce de Leche",
    "price": 40,
    "category": "Postres",
    "ingredients": "2 alfajores de maicena rellenos de dulce de leche y coco rallado.",
    "tag": "Dulce",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 86,
    "name": "Panqué de Elote",
    "price": 45,
    "category": "Postres",
    "ingredients": "Rebanada de panqué artesanal dulce de elote tierno recién horneado.",
    "tag": "Clásico",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 87,
    "name": "Panqué de Plátano y Nuez",
    "price": 45,
    "category": "Postres",
    "ingredients": "Rebanada de panqué casero de plátano con trozos de nuez pecana.",
    "tag": "Clásico",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 88,
    "name": "Galleta Double Chocolate",
    "price": 30,
    "category": "Postres",
    "ingredients": "Galleta de chocolate oscuro fudge con chispas de chocolate blanco.",
    "tag": "Dulce",
    "time": "2 min",
    "image": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 89,
    "name": "Tarta de Nuez Pecana",
    "price": 60,
    "category": "Postres",
    "ingredients": "Tarta clásica horneada rellena de nuez pecana y caramelo suave.",
    "tag": "Clásico",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 90,
    "name": "Crumble de Manzana",
    "price": 55,
    "category": "Postres",
    "ingredients": "Manzanas horneadas con canela y cubierta crujiente de avena y mantequilla.",
    "tag": "Popular",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 91,
    "name": "Helado de Chocolate Belga",
    "price": 45,
    "category": "Postres",
    "ingredients": "Dos bolas de helado cremoso premium de chocolate belga.",
    "tag": "Dulce",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1594911774802-8822a707cff3?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 92,
    "name": "Torta de Elote y Cajeta",
    "price": 55,
    "category": "Postres",
    "ingredients": "Pastel rústico de elote humedecido con cajeta artesanal de Celaya.",
    "tag": "Clásico",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 93,
    "name": "Muffin de Matcha",
    "price": 48,
    "category": "Postres",
    "ingredients": "Muffin horneado de té matcha con cobertura fina de chocolate blanco.",
    "tag": "Refrescante",
    "time": "3 min",
    "image": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 94,
    "name": "Chilaquiles Verdes",
    "price": 110,
    "category": "Desayunos",
    "ingredients": "Totopos de maíz crujientes en salsa verde, crema ácida, queso fresco y cebolla.",
    "tag": "Picante",
    "time": "12 min",
    "image": "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 95,
    "name": "Avocado Toast",
    "price": 120,
    "category": "Desayunos",
    "ingredients": "Pan de masa madre tostado, puré de aguacate sazonado, huevo pochado y semillas.",
    "tag": "Saludable",
    "time": "10 min",
    "image": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 96,
    "name": "Panini de Jamón y Queso",
    "price": 85,
    "category": "Desayunos",
    "ingredients": "Pan ciabatta artesanal tostado con jamón de pechuga de pavo, queso gouda y aderezo.",
    "tag": "Popular",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 97,
    "name": "Sandwich Club Clásico",
    "price": 90,
    "category": "Desayunos",
    "ingredients": "Sándwich de tres pisos con pollo a la plancha, jamón, tocino, queso, lechuga y tomate.",
    "tag": "Popular",
    "time": "10 min",
    "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 98,
    "name": "Bagel con Queso Crema",
    "price": 55,
    "category": "Desayunos",
    "ingredients": "Bagel recién horneado untado con queso crema philadelphia.",
    "tag": "Clásico",
    "time": "5 min",
    "image": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 99,
    "name": "Bagel de Salmón Ahumado",
    "price": 115,
    "category": "Desayunos",
    "ingredients": "Bagel artesanal con queso crema, salmón ahumado premium, alcaparras y cebolla morada.",
    "tag": "Popular",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 100,
    "name": "Panini de Tres Quesos",
    "price": 80,
    "category": "Desayunos",
    "ingredients": "Pan panini crujiente relleno de queso gouda, provolone y crema de queso de cabra.",
    "tag": "Popular",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 101,
    "name": "Panini Pollo Chipotle",
    "price": 95,
    "category": "Desayunos",
    "ingredients": "Pechuga de pollo a la plancha con aderezo chipotle de la casa en pan ciabatta.",
    "tag": "Picante",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 102,
    "name": "Ensalada César con Pollo",
    "price": 85,
    "category": "Desayunos",
    "ingredients": "Lechuga romana fresca, pollo, crutones, queso parmesano y aderezo césar.",
    "tag": "Saludable",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 103,
    "name": "Ensalada de Frutas de Temporada",
    "price": 60,
    "category": "Desayunos",
    "ingredients": "Mezcla de melón, papaya, piña y plátano servido con miel y granola.",
    "tag": "Saludable",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 104,
    "name": "Chilaquiles Rojos con Huevo",
    "price": 120,
    "category": "Desayunos",
    "ingredients": "Totopos de maíz crujientes en salsa roja de jitomate, con dos huevos fritos.",
    "tag": "Clásico",
    "time": "12 min",
    "image": "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 105,
    "name": "Huevos Revueltos al Gusto",
    "price": 80,
    "category": "Desayunos",
    "ingredients": "Tres huevos revueltos acompañados de frijoles refritos y totopos.",
    "tag": "Clásico",
    "time": "10 min",
    "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 106,
    "name": "Omelette de Claras Espinaca",
    "price": 95,
    "category": "Desayunos",
    "ingredients": "Omelette elaborado con claras de huevo, espinacas frescas y queso panela.",
    "tag": "Saludable",
    "time": "10 min",
    "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 107,
    "name": "Molletes Clásicos de Frijol",
    "price": 75,
    "category": "Desayunos",
    "ingredients": "Dos mitades de bolillo con frijoles refritos, queso manchego gratinado y pico de gallo.",
    "tag": "Clásico",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 108,
    "name": "Hot Cakes de Avena y Plátano",
    "price": 80,
    "category": "Desayunos",
    "ingredients": "Tres hot cakes saludables elaborados con avena molida y plátano, con miel.",
    "tag": "Saludable",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 109,
    "name": "French Toast Clásico",
    "price": 85,
    "category": "Desayunos",
    "ingredients": "Pan brioche remojado en mezcla de huevo y leche, dorado a la mantequilla con frutas.",
    "tag": "Dulce",
    "time": "10 min",
    "image": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 110,
    "name": "Yogur Griego con Miel",
    "price": 55,
    "category": "Desayunos",
    "ingredients": "Yogur griego cremoso natural con miel, nueces y fresas picadas.",
    "tag": "Saludable",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 111,
    "name": "Sándwich de Pavo Integral",
    "price": 70,
    "category": "Desayunos",
    "ingredients": "Pan de caja integral tostado con jamón de pavo, queso panela, lechuga y tomate.",
    "tag": "Saludable",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 112,
    "name": "Huevos Benedictinos",
    "price": 130,
    "category": "Desayunos",
    "ingredients": "Dos huevos pochados sobre panecillo inglés con lomo canadiense y salsa holandesa.",
    "tag": "Popular",
    "time": "12 min",
    "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 113,
    "name": "Molletes con Chorizo",
    "price": 85,
    "category": "Desayunos",
    "ingredients": "Molletes tradicionales gratinados con frijoles refritos y chorizo dorado.",
    "tag": "Clásico",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 114,
    "name": "Ensalada de Quinoa",
    "price": 90,
    "category": "Desayunos",
    "ingredients": "Quinoa mixta con aguacate, pepino, tomate cherry y aderezo de limón.",
    "tag": "Vegano",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 115,
    "name": "Avena Caliente Orgánica",
    "price": 50,
    "category": "Desayunos",
    "ingredients": "Avena cocida en leche con manzana picada, canela, nueces y pasas.",
    "tag": "Saludable",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 116,
    "name": "Panini de Huevo Tocino",
    "price": 90,
    "category": "Desayunos",
    "ingredients": "Huevo revuelto con tocino crujiente, queso cheddar gratinado en pan ciabatta.",
    "tag": "Popular",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 117,
    "name": "Tostada de Hummus y Huevo",
    "price": 105,
    "category": "Desayunos",
    "ingredients": "Pan de masa madre tostado untado con hummus artesanal y huevo estrellado encima.",
    "tag": "Saludable",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 118,
    "name": "Crepas de Pollo Rajas",
    "price": 95,
    "category": "Desayunos",
    "ingredients": "Dos crepas saladas rellenas de pollo deshebrado en salsa cremosa de rajas poblanas.",
    "tag": "Picante",
    "time": "10 min",
    "image": "https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 119,
    "name": "Sincronizadas con Jamón",
    "price": 60,
    "category": "Desayunos",
    "ingredients": "Tortillas de harina con jamón y abundante queso manchego fundido.",
    "tag": "Clásico",
    "time": "6 min",
    "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 120,
    "name": "Waffle Salado Huevo Tocino",
    "price": 95,
    "category": "Desayunos",
    "ingredients": "Waffle crujiente de la casa con un huevo frito y tiras de tocino encima.",
    "tag": "Popular",
    "time": "10 min",
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 121,
    "name": "Tazón Chía y Almendras",
    "price": 65,
    "category": "Desayunos",
    "ingredients": "Pudín de semillas de chía hidratadas en leche de almendras con frutos secos.",
    "tag": "Vegano",
    "time": "4 min",
    "image": "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=300&auto=format&fit=crop"
  },
  {
    "id": 122,
    "name": "Molletes Especiales Champiñones",
    "price": 85,
    "category": "Desayunos",
    "ingredients": "Molletes gratinados tradicionales con guisado de champiñones salteados con epazote.",
    "tag": "Saludable",
    "time": "8 min",
    "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=300&auto=format&fit=crop"
  }
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
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: duration,
        delay: delay,
        useNativeDriver: false,
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
      useNativeDriver: false,
      speed: 20,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: false,
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

const OrderTrackingCard = ({ order, colors, styles, onPress }) => {
  const isReady = order.status === 'listo';
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isReady) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: false })
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isReady]);

  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, '#34C759']
  });

  const shadowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.02, 0.25]
  });

  let badgeColor = colors.warning;
  let badgeText = 'Pendiente';
  if (order.status === 'en_preparacion') {
    badgeColor = colors.info;
    badgeText = 'En Preparación';
  } else if (order.status === 'listo') {
    badgeColor = colors.success;
    badgeText = 'Listo';
  } else if (order.status === 'entregado') {
    badgeColor = '#6c5ce7';
    badgeText = 'Entregado';
  } else if (order.status === 'cancelado') {
    badgeColor = colors.danger;
    badgeText = 'Cancelado';
  }

  return (
    <Animated.View
      style={{
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: isReady ? 2.5 : 1,
        borderColor: isReady ? borderColor : colors.border,
        shadowColor: isReady ? '#34C759' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isReady ? shadowOpacity : 0.02,
        shadowRadius: 10,
        elevation: isReady ? 4 : 2,
        backgroundColor: colors.cardBg,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{ padding: 18 }}
      >
        <View style={styles.tableHeaderFlex}>
          <Text style={[styles.cardTitleText, { color: colors.textMain }]}>Pedido #{order.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={[styles.statusBadgeText, { color: '#ffffff' }]}>{badgeText}</Text>
          </View>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>
          {order.tableName || order.table || `Mesa ${order.tableId}`} • {order.itemsCount || (order.items || []).length} artículo(s)
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ClienteMesero(props) {
  const { onBack, notifiedReadyOrderIds, setNotifiedReadyOrderIds, token, setToken, sessionUser, inicioTurno } = props;

  // --- TABLES STATE ---
  const [localTables, setLocalTables] = useState([
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
  ]);
  const tables = props.tables || localTables;
  const setTables = props.setTables || setLocalTables;

  // Cooking Tracking State
  const [localOrders, setLocalOrders] = useState([]);
  const orders = props.orders || localOrders;
  const setOrders = props.setOrders || setLocalOrders;

  // --- AUTH / PROFILE STATE ---
  // El usuario ya viene autenticado desde el login unificado.
  const [currentUser, setCurrentUser] = useState(
    sessionUser
      ? {
          id: sessionUser.id_usuario,
          name: sessionUser.nombre,
          lastNameP: sessionUser.apellido_paterno || '',
          lastNameM: sessionUser.apellido_materno || '',
          email: sessionUser.correo,
          phone: sessionUser.telefono || '',
          role: sessionUser.rol === 'admin' ? 'Administrador' : 'Mesero',
        }
      : null
  );
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Waiter profile fields
  const [editName, setEditName] = useState(sessionUser?.nombre || '');
  const [editLastNameP, setEditLastNameP] = useState(sessionUser?.apellido_paterno || '');
  const [editLastNameM, setEditLastNameM] = useState(sessionUser?.apellido_materno || '');
  const [editEmail, setEditEmail] = useState(sessionUser?.correo || '');
  const [editPhone, setEditPhone] = useState(sessionUser?.telefono || '');
  const [editPassword, setEditPassword] = useState('');
  const [editPassword2, setEditPassword2] = useState('');

  // Waiter shift statistics computed dynamically
  const stats = React.useMemo(() => {
    if (!currentUser) return { sales: 0, activeTables: 0, completed: 0, hourlyStats: [] };

    const waiterName = (currentUser.nombre || currentUser.name || '').trim().toLowerCase();
    const waiterUsername = (currentUser.usuario || '').trim().toLowerCase();

    const activeOrders = orders.filter(o => {
      const w = (o.waiter || '').trim().toLowerCase();
      const isMyOrder = w && (w.includes(waiterName) || w.includes(waiterUsername));
      return isMyOrder && o.status !== 'entregado' && o.status !== 'cancelado';
    });
    const activeTables = new Set(activeOrders.map(o => o.tableId)).size;

    const todayStr = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
    const completedOrders = orders.filter(o => {
      const w = (o.waiter || '').trim().toLowerCase();
      const isMyOrder = w && (w.includes(waiterName) || w.includes(waiterUsername));
      return isMyOrder && o.status === 'entregado' && o.fecha === todayStr;
    });

    const sessionSales = completedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const sessionCompleted = completedOrders.length;

    // Group completed orders by hour
    const hourlySalesMap = {};
    completedOrders.forEach(o => {
      let hourStr = '12 PM';
      if (o.time) {
        const cleanTime = o.time.replace(/\s+/g, ' ');
        const parts = cleanTime.split(':');
        if (parts.length > 0) {
          let h = parseInt(parts[0]);
          const isPM = cleanTime.toLowerCase().includes('pm');
          const isAM = cleanTime.toLowerCase().includes('am');
          
          if (!isPM && !isAM && parts.length > 1) {
            let displayHour = h % 12;
            if (displayHour === 0) displayHour = 12;
            const ampm = h >= 12 ? 'PM' : 'AM';
            hourStr = `${String(displayHour).padStart(2, '0')} ${ampm}`;
          } else {
            if (isPM && h < 12) h += 12;
            if (isAM && h === 12) h = 0;
            let displayHour = h % 12;
            if (displayHour === 0) displayHour = 12;
            const ampm = h >= 12 ? 'PM' : 'AM';
            hourStr = `${String(displayHour).padStart(2, '0')} ${ampm}`;
          }
        }
      }
      hourlySalesMap[hourStr] = (hourlySalesMap[hourStr] || 0) + (o.total || 0);
    });

    const hoursToShow = ['09 AM', '10 AM', '11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM', '08 PM'];
    const maxVal = Math.max(...hoursToShow.map(h => hourlySalesMap[h] || 0), 1);
    const hourlyStats = hoursToShow.map(h => {
      const val = parseFloat((hourlySalesMap[h] || 0).toFixed(2));
      const height = Math.max(5, Math.min(100, (val / maxVal) * 100));
      return { hour: h, val, height };
    });

    return {
      sales: parseFloat(sessionSales.toFixed(2)),
      activeTables: activeTables || tables.filter(t => t.status === 'busy').length,
      completed: sessionCompleted,
      hourlyStats
    };
  }, [orders, currentUser, tables]);

  const salesTotal = stats.sales;
  const completedOrdersCount = stats.completed;
  const activeTablesCount = stats.activeTables;
  const setActiveTablesCount = () => {};

  // Duracion real del turno, contada desde el inicio de sesion.
  const shiftTime = useTurno(inicioTurno);
  const { aviso, confirmar, cerrarAviso } = useAviso();

  // --- SCREEN NAVIGATION STATE ---
  // Se entra directo al mapa de mesas: la autenticacion ocurre en el login unificado.
  const [currentScreen, setCurrentScreen] = useState('mesas'); // mesas, menu, customization, summary, tracking, details, close_account, config, edit_profile, statistics, notifications_history
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [showReceptionWizard, setShowReceptionWizard] = useState(false);
  const [wizardPartyCount, setWizardPartyCount] = useState(2);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [reservations, setReservations] = useState([]);
  const [reserveName, setReserveName] = useState('');
  const [reservePhone, setReservePhone] = useState('');
  const [reserveTableId, setReserveTableId] = useState(null);
  const [reserveDate, setReserveDate] = useState('');
  const [reserveTime, setReserveTime] = useState('');

  const handleDateChange = (text) => {
    if (text.length < reserveDate.length) {
      setReserveDate(text);
      return;
    }
    let numbers = text.replace(/[^0-9]/g, '');
    let formatted = '';
    if (numbers.length > 0) {
      let year = numbers.slice(0, 4);
      if (year.length === 4) {
        const currentYear = new Date().getFullYear();
        if (parseInt(year) < currentYear) {
          year = String(currentYear);
        }
      }
      formatted += year;
      if (numbers.length > 4) {
        formatted += '/';
        let month = numbers.slice(4, 6);
        if (month.length === 2) {
          let mVal = parseInt(month);
          if (mVal > 12) month = '12';
          if (mVal === 0) month = '01';
        } else if (month.length === 1) {
          if (parseInt(month) > 1) {
            month = '0' + month;
          }
        }
        formatted += month;
        if (numbers.length > 6) {
          formatted += '/';
          let day = numbers.slice(6, 8);
          if (day.length === 2) {
            let dVal = parseInt(day);
            if (dVal > 31) day = '31';
            if (dVal === 0) day = '01';
          } else if (day.length === 1) {
            if (parseInt(day) > 3) {
              day = '0' + day;
            }
          }
          formatted += day;
        }
      }
    }
    setReserveDate(formatted);
  };

  const handleTimeChange = (text) => {
    if (text.length < reserveTime.length) {
      setReserveTime(text);
      return;
    }
    let numbers = text.replace(/[^0-9]/g, '');
    let formatted = '';
    if (numbers.length > 0) {
      let hours = numbers.slice(0, 2);
      if (hours.length === 2) {
        let hVal = parseInt(hours);
        if (hVal > 23) hours = '23';
      } else if (hours.length === 1) {
        if (parseInt(hours) > 2) {
          hours = '0' + hours;
        }
      }
      formatted += hours;
      if (numbers.length > 2) {
        formatted += ':';
        let minutes = numbers.slice(2, 4);
        if (minutes.length === 2) {
          let mVal = parseInt(minutes);
          if (mVal > 59) minutes = '59';
        } else if (minutes.length === 1) {
          if (parseInt(minutes) > 5) {
            minutes = '0' + minutes;
          }
        }
        formatted += minutes;
      }
    }
    setReserveTime(formatted);
  };

  const borderGlowAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderGlowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(borderGlowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const glowingBorderColor = borderGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(154, 123, 28, 0.3)', 'rgba(154, 123, 28, 1)'],
  });

  const glowingBorderWidth = borderGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 3.5],
  });

  const greenGlowColor = borderGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#28a745', '#a5d6a7']
  });

  const greenGlowBg = borderGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(40, 167, 69, 0.15)', 'rgba(40, 167, 69, 0.45)']
  });

  const greenGlowWidth = borderGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 3]
  });

  React.useEffect(() => {
    const quotes = [
      "¡Haz de hoy un gran día para nuestros clientes!",
      "El trabajo en equipo divide el esfuerzo y multiplica el resultado.",
      "Un café excelente y una gran sonrisa hacen la diferencia.",
      "Cada taza que sirves es una oportunidad para alegrar el día de alguien.",
      "La excelencia no es un acto, es un hábito. ¡Vamos con todo hoy!",
      "Tu actitud determina la experiencia del cliente. ¡Hazla increíble!",
      "¡El éxito es la suma de pequeños esfuerzos repetidos día tras día!",
      "Café caliente, sonrisas cálidas. ¡Buen turno!"
    ];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setMotivationalMessage(quotes[randomIndex]);
  }, [currentUser]);

  // --- SEARCH, FILTERS & SORTING ---
  const [selectedTableStatus, setSelectedTableStatus] = useState('Todas');
  const [selectedTableZone, setSelectedTableZone] = useState('Todas');
  const [partyCount, setPartyCount] = useState(4);

  // Menu catalog filters
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('Todos');
  const [menuSortOption, setMenuSortOption] = useState('Default');

  // Orders filters
  const [selectedOrderTrackingFilter, setSelectedOrderTrackingFilter] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('Hoy');

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
  const [localTableCarts, setLocalTableCarts] = useState({});
  const tableCarts = props.tableCarts || localTableCarts;
  const setTableCarts = props.setTableCarts || setLocalTableCarts;
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountReason, setDiscountReason] = useState('');

  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState('16');

  // Billing states
  const [billingTableId, setBillingTableId] = useState(4);
  const [tipPercentage, setTipPercentage] = useState(10);
  const [customTip, setCustomTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta');

  // --- NOTIFICATION LOG STATE ---
  const [notificationHistory, setNotificationHistory] = useState([
    { id: '1', type: 'system', message: 'Turno de mesero iniciado con éxito.', time: '10:00 AM', read: true },
    { id: '2', type: 'kitchen', message: 'Pedido #17 (Mesa 2) está LISTO en barra.', time: '10:15 AM', read: false },
    { id: '3', type: 'kitchen', message: 'Pedido #16 (Mesa 4) cambió a Preparación.', time: '10:40 AM', read: false }
  ]);

  const getProductIngredients = (productName) => {
    switch (productName) {
      case 'Café Americano':
      case 'Espresso Doble':
        return [
          { name: 'Cafe en grano', amount: 0.02 }
        ];
      case 'Capuchino Clásico':
        return [
          { name: 'Cafe en grano', amount: 0.02 },
          { name: 'Leche entera', amount: 0.2 }
        ];
      case 'Latte de Vainilla':
        return [
          { name: 'Cafe en grano', amount: 0.02 },
          { name: 'Leche entera', amount: 0.2 },
          { name: 'Jarabe de vainilla', amount: 0.02 }
        ];
      case 'Espresso Macchiato':
        return [
          { name: 'Cafe en grano', amount: 0.015 },
          { name: 'Leche entera', amount: 0.05 }
        ];
      case 'Flat White':
        return [
          { name: 'Cafe en grano', amount: 0.02 },
          { name: 'Leche entera', amount: 0.15 }
        ];
      case 'Moka Caliente':
      case 'Moka Blanco Caliente':
        return [
          { name: 'Cafe en grano', amount: 0.02 },
          { name: 'Leche entera', amount: 0.2 },
          { name: 'Chocolate en polvo', amount: 0.02 }
        ];
      case 'Caramel Macchiato':
        return [
          { name: 'Cafe en grano', amount: 0.02 },
          { name: 'Leche entera', amount: 0.2 },
          { name: 'Jarabe de vainilla', amount: 0.01 },
          { name: 'Azucar', amount: 0.01 }
        ];
      case 'Cortado de la Casa':
        return [
          { name: 'Cafe en grano', amount: 0.015 },
          { name: 'Leche entera', amount: 0.1 }
        ];
      case 'Panini de Jamón y Queso':
      case 'Panini de Tres Quesos':
      case 'Panini Pollo Chipotle':
      case 'Panini de Huevo Tocino':
        return [
          { name: 'Pan para panini', amount: 1 }
        ];
      case 'Croissant Francés':
      case 'Croissant de Almendras':
        return [
          { name: 'Croissants', amount: 1 }
        ];
      case 'Muffin de Chocolate':
        return [
          { name: 'Chocolate en polvo', amount: 0.02 },
          { name: 'Leche entera', amount: 0.05 }
        ];
      case 'Muffin de Arándanos':
        return [
          { name: 'Leche entera', amount: 0.05 }
        ];
      default:
        // Try simple name matching if full name fails
        if (productName.includes('Café') || productName.includes('Espresso')) {
          return [{ name: 'Cafe en grano', amount: 0.02 }];
        }
        if (productName.includes('Panini')) {
          return [{ name: 'Pan para panini', amount: 1 }];
        }
        if (productName.includes('Croissant')) {
          return [{ name: 'Croissants', amount: 1 }];
        }
        return [];
    }
  };

  const deductInventoryForOrder = (items) => {
    if (!props.setInventory || !props.inventory) return;
    props.setInventory(prevInv => {
      return prevInv.map(invItem => {
        let deductedAmount = 0;
        items.forEach(item => {
          const qty = item.qty;
          const reqIngredients = getProductIngredients(item.product?.name || item.name || '');
          const req = reqIngredients.find(r => r.name === invItem.name);
          if (req) {
            deductedAmount += req.amount * qty;
          }
        });
        if (deductedAmount > 0) {
          const newActual = Math.max(0, parseFloat((invItem.actual - deductedAmount).toFixed(3)));
          return { ...invItem, actual: newActual };
        }
        return invItem;
      });
    });
  };

  const restockInventoryForOrder = (items) => {
    if (!props.setInventory || !props.inventory) return;
    props.setInventory(prevInv => {
      return prevInv.map(invItem => {
        let restockedAmount = 0;
        items.forEach(item => {
          const qty = item.qty;
          const reqIngredients = getProductIngredients(item.product?.name || item.name || '');
          const req = reqIngredients.find(r => r.name === invItem.name);
          if (req) {
            restockedAmount += req.amount * qty;
          }
        });
        if (restockedAmount > 0) {
          const newActual = parseFloat((invItem.actual + restockedAmount).toFixed(3));
          return { ...invItem, actual: newActual };
        }
        return invItem;
      });
    });
  };

  const checkInventoryForProduct = (product, quantity) => {
    if (!props.inventory) return true;
    const reqIngredients = getProductIngredients(product.name);
    for (const req of reqIngredients) {
      const invItem = props.inventory.find(i => i.name === req.name);
      if (invItem) {
        const requiredAmount = req.amount * quantity;
        if (invItem.actual < requiredAmount) {
          Alert.alert(
            'Ingredientes Insuficientes',
            `No hay suficiente stock de "${invItem.name}" para preparar este platillo. (Disponible: ${invItem.actual} ${invItem.unit}, Requerido: ${requiredAmount.toFixed(2)} ${invItem.unit})`
          );
          return false;
        }
      }
    }
    return true;
  };

  const isInitialLoadRef = useRef(true);
  const [activeReadyOrder, setActiveReadyOrder] = useState(null);
  const [showReadyModal, setShowReadyModal] = useState(false);

  const [notifiedCancelledOrderIds, setNotifiedCancelledOrderIds] = useState([]);
  const isInitialLoadCancelledRef = useRef(true);

  useEffect(() => {
    if (!currentUser || !orders || !notifiedReadyOrderIds || !setNotifiedReadyOrderIds) return;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayLocalStr = `${yyyy}-${mm}-${dd}`;

    const waiterName = (currentUser.name || '').trim().toLowerCase();
    const waiterUsername = (currentUser.usuario || '').trim().toLowerCase();

    // Ready Orders Notification
    if (isInitialLoadRef.current && orders.length > 0) {
      const initialIds = orders
        .filter(o => o.status === 'listo' && o.fecha === todayLocalStr)
        .map(o => o.id);
      setNotifiedReadyOrderIds(initialIds);
      isInitialLoadRef.current = false;
    } else {
      orders.forEach(o => {
        if (o.status === 'listo' && o.fecha === todayLocalStr) {
          const hasBeenNotified = notifiedReadyOrderIds.includes(o.id);
          if (!hasBeenNotified) {
            setNotifiedReadyOrderIds(prev => [...prev, o.id]);
            
            const w = (o.waiter || '').trim().toLowerCase();
            const isMyOrder = w && (w.includes(waiterName) || w.includes(waiterUsername));
            
            if (isMyOrder) {
              triggerAlertNotification(`¡Pedido #${o.id} para ${o.tableName || o.table || 'Mesa'} está LISTO en barra!`, 'kitchen');
              setActiveReadyOrder(o);
              setShowReadyModal(true);
              
              const { Alert } = require('react-native');
              Alert.alert(
                '¡Pedido Listo!',
                `El Pedido #${o.id} para la ${o.tableName || o.table} ya está LISTO en barra para entregar.`
              );
            }
          }
        }
      });
    }

    // Cancelled Orders Notification
    if (isInitialLoadCancelledRef.current && orders.length > 0) {
      const initialCancelledIds = orders
        .filter(o => o.status === 'cancelado' && o.fecha === todayLocalStr)
        .map(o => o.id);
      setNotifiedCancelledOrderIds(initialCancelledIds);
      isInitialLoadCancelledRef.current = false;
    } else {
      orders.forEach(o => {
        if (o.status === 'cancelado' && o.fecha === todayLocalStr) {
          const hasBeenNotified = notifiedCancelledOrderIds.includes(o.id);
          if (!hasBeenNotified) {
            setNotifiedCancelledOrderIds(prev => [...prev, o.id]);
            
            const w = (o.waiter || '').trim().toLowerCase();
            const isMyOrder = w && (w.includes(waiterName) || w.includes(waiterUsername));
            
            if (isMyOrder) {
              triggerAlertNotification(`⚠️ El Pedido #${o.id} de la ${o.tableName || o.table} ha sido CANCELADO por Cocina.`, 'kitchen');
              const { Alert } = require('react-native');
              Alert.alert(
                'Pedido Cancelado por Cocina',
                `El Pedido #${o.id} de la ${o.tableName || o.table} ha sido cancelado por el personal de cocina.`
              );
            }
          }
        }
      });
    }
  }, [orders, currentUser, notifiedReadyOrderIds, notifiedCancelledOrderIds]);

  // --- ACTIONS SLIDE BANNER ---
  const notificationAnim = useRef(new Animated.Value(400)).current;
  const [kitchenNotification, setKitchenNotification] = useState(null);
  const activeAnimRef = useRef(null);
  const sidebarAnim = useRef(new Animated.Value(-280)).current;

  // Bell wiggle animation setup
  const bellWiggleAnim = useRef(new Animated.Value(0)).current;
  const unreadCount = notificationHistory.filter(n => !n.read).length;

  React.useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const wiggle = () => {
      if (!isMounted || unreadCount === 0) return;
      Animated.sequence([
        Animated.timing(bellWiggleAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.timing(bellWiggleAnim, { toValue: -1, duration: 100, useNativeDriver: false }),
        Animated.timing(bellWiggleAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.timing(bellWiggleAnim, { toValue: -1, duration: 100, useNativeDriver: false }),
        Animated.timing(bellWiggleAnim, { toValue: 0, duration: 100, useNativeDriver: false }),
      ]).start(() => {
        timeoutId = setTimeout(() => {
          wiggle();
        }, 3000);
      });
    };

    if (unreadCount > 0) {
      wiggle();
    } else {
      bellWiggleAnim.setValue(0);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [unreadCount]);

  const bellRotation = bellWiggleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-18deg', '18deg'],
  });

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
    
    if (activeAnimRef.current) {
      activeAnimRef.current.stop();
    }
    
    notificationAnim.setValue(400);

    const anim = Animated.sequence([
      Animated.timing(notificationAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }),
      Animated.delay(4000),
      Animated.timing(notificationAnim, {
        toValue: 400,
        duration: 350,
        useNativeDriver: false,
      })
    ]);
    
    activeAnimRef.current = anim;
    anim.start(({ finished }) => {
      if (finished) {
        setKitchenNotification(null);
        activeAnimRef.current = null;
      }
    });
  };

  const dismissNotification = () => {
    if (activeAnimRef.current) {
      activeAnimRef.current.stop();
    }
    Animated.timing(notificationAnim, {
      toValue: 400,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setKitchenNotification(null);
      activeAnimRef.current = null;
    });
  };

  const clickNotification = () => {
    dismissNotification();
    setCurrentScreen('notifications_history');
  };

  const toggleSidebar = (open) => {
    if (open) {
      setSidebarOpen(true);
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: -280,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setSidebarOpen(false));
    }
  };

  // --- ACTIONS HANDLERS ---

  const getProductQtyInCart = (productId) => {
    const cart = tableCarts[activeTableId] || [];
    const items = cart.filter(item => item.product.id === productId);
    return items.reduce((acc, item) => acc + item.qty, 0);
  };

  const handleQuickAdd = (product) => {
    const currentQty = getProductQtyInCart(product.id);
    if (!checkInventoryForProduct(product, currentQty + 1)) return;

    setTableCarts(prevCarts => {
      const currentCart = [...(prevCarts[activeTableId] || [])];
      const existingItemIndex = currentCart.findIndex(item => item.product.id === product.id && !item.extraShot && item.milk === 'Entera' && !item.notes);

      if (existingItemIndex > -1) {
        const item = currentCart[existingItemIndex];
        currentCart[existingItemIndex] = {
          ...item,
          qty: item.qty + 1,
          calculatedPrice: (item.calculatedPrice / item.qty) * (item.qty + 1)
        };
      } else {
        currentCart.push({
          product,
          qty: 1,
          sentQty: 0,
          milk: 'Entera',
          extraShot: false,
          syrupVanilla: false,
          notes: '',
          calculatedPrice: product.price
        });
      }
      return { ...prevCarts, [activeTableId]: currentCart };
    });
    triggerAlertNotification(`${product.name} (x1) agregado.`);
  };

  const handleQuickRemove = (product) => {
    setTableCarts(prevCarts => {
      const currentCart = [...(prevCarts[activeTableId] || [])];
      const existingItemIndex = currentCart.findIndex(item => item.product.id === product.id);

      if (existingItemIndex > -1) {
        const item = currentCart[existingItemIndex];
        const minQty = item.sentQty || 0;
        if (item.qty > minQty) {
          if (item.qty > 1) {
            const singleItemPrice = item.calculatedPrice / item.qty;
            currentCart[existingItemIndex] = {
              ...item,
              qty: item.qty - 1,
              calculatedPrice: singleItemPrice * (item.qty - 1)
            };
          } else {
            currentCart.splice(existingItemIndex, 1);
          }
          triggerAlertNotification(`${product.name} removido.`);
        } else {
          Alert.alert('Imposible Eliminar', 'Este producto ya fue enviado a cocina y no se puede remover.');
        }
      }
      return { ...prevCarts, [activeTableId]: currentCart };
    });
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

  const updateTableStatusOnBackend = (tableId, estado) => {
    if (!token) return;
    fetch(`${API_BASE_URL}/mesas/${tableId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estado })
    })
      .then(res => {
        if (!res.ok) console.log("Failed to update table status on backend");
      })
      .catch(err => console.log("Error updating table status:", err));
  };

  const handleOpenMesa = (table) => {
    updateTableStatusOnBackend(table.id, 'ocupada');
    setTables(prevTables =>
      prevTables.map(t => (t.id === table.id ? { ...t, status: 'busy', occupants: `${partyCount}/${t.capacity}`, totalAccount: 0 } : t))
    );
    setActiveTableId(table.id);
    setActiveTablesCount(prev => prev + 1);
    setIsTableDetailDrawerVisible(false);
    setCurrentScreen('menu');

    triggerAlertNotification(`${table.name} asignada a ${partyCount} personas.`);
  };

  const handleAddToCart = () => {
    const currentQty = getProductQtyInCart(customizingProduct.id);
    if (!checkInventoryForProduct(customizingProduct, currentQty + customQty)) return;

    const singlePrice = customizingProduct.price + (selectedMilk === 'Avena' ? 15 : 0) + (extraShot ? 12 : 0) + (syrupVanilla ? 10 : 0);
    const item = {
      product: customizingProduct,
      qty: customQty,
      sentQty: 0,
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

    triggerAlertNotification(`${customizingProduct.name} (x${customQty}) agregado.`);
    setCurrentScreen('menu');
  };

  const handleConfirmOrder = () => {
    const cart = tableCarts[activeTableId] || [];
    const newItems = cart.filter(item => item.qty > (item.sentQty || 0));
    
    if (newItems.length === 0) {
      Alert.alert('Sin Cambios', 'No hay productos nuevos para enviar a cocina.');
      return;
    }

    setIsSendingOrder(true);
    fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_mesa: activeTableId,
        observaciones: specialNotes || '',
        detalles: newItems.map(item => ({
          id_producto: item.product.id,
          cantidad: item.qty - (item.sentQty || 0),
          observaciones: item.notes || ''
        }))
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || 'No se pudo crear el pedido en la base de datos.');
          });
        }
        return res.json();
      })
      .then(data => {
        setIsSendingOrder(false);
        const nextOrderId = String(data.id_pedido || data.id || Math.floor(Math.random() * 900 + 100));
        
        const newCartSub = newItems.reduce((acc, item) => {
          const singlePrice = item.calculatedPrice / item.qty;
          const unsentQty = item.qty - (item.sentQty || 0);
          return acc + (singlePrice * unsentQty);
        }, 0);
        
        const withDiscount = newCartSub * (1 - discountPercent / 100);
        const totalWithTax = parseFloat((withDiscount * 1.16).toFixed(2));

        const newOrder = {
          id: nextOrderId,
          tableId: activeTableId,
          table: `Mesa ${activeTableId}`,
          tableName: `Mesa ${activeTableId}`,
          waiter: currentUser?.name || 'Santiago',
          status: 'pendiente',
          fecha: new Date().toISOString().slice(0, 10),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeStamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          itemsCount: newItems.reduce((acc, item) => acc + (item.qty - (item.sentQty || 0)), 0),
          total: totalWithTax,
          items: newItems.map(item => ({
            ...item,
            qty: item.qty - (item.sentQty || 0)
          })),
          products: newItems.map(item => ({
            name: item.product.name,
            qty: item.qty - (item.sentQty || 0)
          })),
          history: [
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'pendiente', user: 'Sistema', comment: '' }
          ]
        };

        setOrders([newOrder, ...orders]);
        if (props.setNotifications) {
          props.setNotifications(prev => [
            {
              id: Date.now(),
              type: 'new',
              message: `Nuevo pedido #${nextOrderId} recibido - Mesa ${activeTableId}`,
              time: 'Hace un momento',
              read: false
            },
            ...prev
          ]);
        }
        setSelectedTrackingOrderId(nextOrderId);

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
          if (updated[activeTableId]) {
            updated[activeTableId] = updated[activeTableId].map(item => ({
              ...item,
              sentQty: item.qty
            }));
          }
          return updated;
        });

        if (props.setInventory) {
          props.setInventory(prevInv => {
            return prevInv.map(invItem => {
              let deducedAmount = 0;
              newItems.forEach(item => {
                const reqIngredients = getProductIngredients(item.product.name);
                const req = reqIngredients.find(r => r.name === invItem.name);
                if (req) {
                  const unsentQty = item.qty - (item.sentQty || 0);
                  deducedAmount += req.amount * unsentQty;
                }
              });
              if (deducedAmount > 0) {
                const newQty = Math.max(0, parseFloat((invItem.actual - deducedAmount).toFixed(2)));
                return { ...invItem, actual: newQty };
              }
              return invItem;
            });
          });
        }
        setDiscountPercent(0);
        setDiscountReason('');
        setSpecialNotes('');
        triggerAlertNotification(`Pedido #${nextOrderId} enviado a Cocina.`);
        setCurrentScreen('mesas');
      })
      .catch(error => {
        setIsSendingOrder(false);
        Alert.alert('Error de Envío', error.message || 'No se pudo conectar con el servidor.');
      });
  };

  const handleConfirmPayment = () => {
    setIsPaying(true);
    fetch(`${API_BASE_URL}/mesas/${billingTableId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estado: 'esperando_pago' })
    })
      .then(res => {
        setIsPaying(false);
        if (!res.ok) throw new Error('No se pudo notificar a caja.');
        return res.json();
      })
      .then(() => {
        setTables(prevTables =>
          prevTables.map(t => (t.id === billingTableId ? { ...t, waitingPayment: true } : t))
        );
        triggerAlertNotification(`Notificación de cobro para Mesa ${billingTableId} enviada a Caja.`, 'system');
        setCurrentScreen('mesas');
      })
      .catch(error => {
        setIsPaying(false);
        Alert.alert('Error', error.message || 'No se pudo conectar con el servidor.');
      });
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
      triggerAlertNotification(`Mesa ${originId} transferida a Mesa ${destId}.`);
    } else {
      setTables(prevTables =>
        prevTables.map(t => {
          if (t.id === originId) return { ...t, status: 'available', totalAccount: 0 };
          if (t.id === destId) return { ...t, status: 'busy', totalAccount: (destTable.totalAccount || 0) + (originTable.totalAccount || 0) };
          return t;
        })
      );
      triggerAlertNotification(`Cuentas de Mesa ${originId} y Mesa ${destId} unificadas.`);
    }

    setShowTableActionModal(false);
    setDestinationTableId('');
    setIsTableDetailDrawerVisible(false);
    setCurrentScreen('mesas');
  };

  const handleUpdateProfile = () => {
    if (!editName.trim() || !editLastNameP.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Nombre, Apellido Paterno y Correo son obligatorios.');
      return;
    }

    if (editPassword && editPassword !== editPassword2) {
      Alert.alert('Error de Contraseña', 'Las contraseñas nuevas no coinciden.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail.trim())) {
      Alert.alert('Correo Inválido', 'Por favor ingresa un formato de correo electrónico válido.');
      return;
    }

    if (editPhone.trim()) {
      const cleanPhone = editPhone.replace(/[^\d+]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 13) {
        Alert.alert('Teléfono Inválido', 'El número de teléfono debe tener entre 10 y 13 dígitos.');
        return;
      }
    }

    const updateBody = {
      nombre: editName.trim(),
      apellido_paterno: editLastNameP.trim(),
      apellido_materno: editLastNameM.trim(),
      correo: editEmail.trim(),
      telefono: editPhone.trim()
    };

    if (editPassword) {
      updateBody.contrasena = editPassword;
    }

    setIsLoggingIn(true);
    fetch(`${API_BASE_URL}/usuarios/${currentUser?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || 'No se pudo actualizar el perfil.');
          });
        }
        return res.json();
      })
      .then((data) => {
        setIsLoggingIn(false);
        const updatedUser = {
          ...currentUser,
          name: data.nombre,
          lastNameP: data.apellido_paterno || '',
          lastNameM: data.apellido_materno || '',
          email: data.correo,
          phone: data.telefono || ''
        };
        setCurrentUser(updatedUser);
        setEditName(updatedUser.name);
        setEditLastNameP(updatedUser.lastNameP);
        setEditLastNameM(updatedUser.lastNameM);
        setEditEmail(updatedUser.email);
        setEditPhone(updatedUser.phone);
        setEditPassword('');
        setEditPassword2('');
        Alert.alert('Perfil Guardado', 'Los datos personales han sido actualizados con éxito.');
        setCurrentScreen('config');
      })
      .catch((error) => {
        setIsLoggingIn(false);
        Alert.alert('Error al Actualizar', error.message || 'No se pudo conectar con el servidor.');
      });
  };

  // Cerrar sesion se delega al contenedor (App), que limpia la sesion y
  // devuelve al login unificado.
  const handleLogout = () => {
    setCurrentUser(null);
    toggleSidebar(false);
    if (onBack) onBack();
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
    const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
    const matchesTag = selectedTagFilter === 'Todos' || product.tag === selectedTagFilter;

    return matchesSearch && matchesCategory && matchesTag;
  });

  const filteredOrders = orders.filter(order => {
    if (selectedOrderTrackingFilter !== 'Todos' && order.status !== selectedOrderTrackingFilter) return false;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yyyyy = yesterday.getFullYear();
    const ymm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const ydd = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yyyyy}-${ymm}-${ydd}`;

    const orderDate = order.fecha || todayStr;

    if (dateFilter === 'Hoy') {
      if (orderDate !== todayStr) return false;
    } else if (dateFilter === 'Ayer') {
      if (orderDate !== yesterdayStr) return false;
    } else if (dateFilter === 'Semana Pasada') {
      const d = new Date(orderDate);
      const diffTime = Math.abs(now - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 7) return false;
    }

    return true;
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

  // Premium Royal Dark Navy & Antique Gold Palette
  const colors = {
    primary: '#0A1931', // Dark Midnight Navy Royal Blue
    primaryText: darkMode ? '#ffffff' : '#0A1931',
    secondary: '#9A7B1C', // Deep Antique Satin Gold
    accent: '#D4C5B3', // Steamed golden cream
    bg: darkMode ? '#050B14' : '#F5F2EB', // Dark slate blue / Elegant warm beige
    cardBg: darkMode ? 'rgba(10, 25, 49, 0.9)' : 'rgba(255, 255, 255, 0.98)',
    textMain: darkMode ? '#ECEFF4' : '#0A1931',
    textMuted: darkMode ? '#728196' : '#556375',
    border: darkMode ? 'rgba(154, 123, 28, 0.15)' : 'rgba(154, 123, 28, 0.25)',
    success: '#0A1931', // Dark Navy
    danger: '#8C1D1D', // Deep crimson red
    warning: '#9A7B1C', // Dark Gold
    info: '#073B75', // Dark accent blue
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
                if (currentScreen === 'menu') setCurrentScreen('mesas');
                else if (currentScreen === 'customization') setCurrentScreen('menu');
                else if (currentScreen === 'summary') setCurrentScreen('menu');
                else if (currentScreen === 'edit_profile') setCurrentScreen('config');
                else if (currentScreen === 'details') setCurrentScreen('tracking');
                else if (currentScreen === 'statistics' || currentScreen === 'notifications_history') setCurrentScreen('config');
                else setCurrentScreen('mesas');
              }}>
                <Ionicons name="arrow-back" size={20} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuButton} onPress={() => toggleSidebar(true)}>
                <Ionicons name="menu" size={22} color="#ffffff" />
              </TouchableOpacity>
            )}
            <Text style={[styles.headerTitle, { color: '#ffffff' }]}>{title}</Text>
          </View>
          {customRightBtn || (
            currentUser ? (
              <TouchableOpacity
                style={styles.bellButton}
                onPress={() => setCurrentScreen('notifications_history')}
              >
                <Animated.View style={{ transform: [{ rotate: bellRotation }] }}>
                  <Ionicons name="notifications" size={20} color="#ffffff" />
                </Animated.View>
                {unreadCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : null
          )}
        </View>
        {subtitle && <Text style={[styles.headerSubtitle, { color: colors.accent }]}>{subtitle}</Text>}
      </View>
    );
  };

  const renderFooter = (activeTab) => {
    return (
      <View style={[styles.footerContainer, { backgroundColor: colors.cardBg, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.footerTab} onPress={() => setCurrentScreen('mesas')}>
          <Ionicons name="home" size={20} color={activeTab === 'mesas' ? colors.primaryText : colors.textMuted} />
          <Text style={[styles.footerLabel, { color: activeTab === 'mesas' ? colors.primaryText : colors.textMuted }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab} onPress={() => setCurrentScreen('menu')}>
          <Ionicons name="restaurant" size={20} color={activeTab === 'menu' ? colors.primaryText : colors.textMuted} />
          <Text style={[styles.footerLabel, { color: activeTab === 'menu' ? colors.primaryText : colors.textMuted }]}>Menú</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab} onPress={() => setCurrentScreen('tracking')}>
          <Ionicons name="cube" size={20} color={activeTab === 'tracking' ? colors.primaryText : colors.textMuted} />
          <Text style={[styles.footerLabel, { color: activeTab === 'tracking' ? colors.primaryText : colors.textMuted }]}>Pedidos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab} onPress={() => setCurrentScreen('config')}>
          <Ionicons name="settings" size={20} color={activeTab === 'config' ? colors.primaryText : colors.textMuted} />
          <Text style={[styles.footerLabel, { color: activeTab === 'config' ? colors.primaryText : colors.textMuted }]}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }]}>
      <View style={[styles.appContainer, { backgroundColor: colors.bg }]}>
        <StatusBar style="light" />

        {/* --- FLOATING NOTIFICATION --- */}
        {kitchenNotification ? (
          <Animated.View style={[styles.notificationBanner, { transform: [{ translateX: notificationAnim }], backgroundColor: '#2e7d32' }]}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={clickNotification}>
              <Ionicons name="notifications" size={18} color="#ffffff" />
              <Text style={[styles.notificationText, { flex: 1 }]} numberOfLines={2}>
                {kitchenNotification}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4, marginLeft: 8 }} onPress={dismissNotification}>
              <Ionicons name="close-circle" size={22} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        {/* --- SCREEN: LOGIN --- */}
        {/* --- SCREEN: ASIGNAR MESA (MAPA DE MESAS INTERACTIVO / SPATIAL MAP) --- */}
        {currentScreen === 'mesas' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('CoffeeFlow • Panel de Mesero', `Bienvenido, ${currentUser?.name || 'Mesero'}`)}

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>

              {/* TWO GIANTS BUTTONS FOR FIRST-DAY WAITER */}
              <View style={{ gap: 12, marginBottom: 20 }}>
                <Animated.View style={{
                  borderRadius: 18,
                  borderWidth: glowingBorderWidth,
                  borderColor: glowingBorderColor,
                  padding: 2,
                  shadowColor: colors.secondary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: borderGlowAnim,
                  shadowRadius: 10,
                }}>
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
                      <Ionicons name="people" size={28} color="#ffffff" />
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
                </Animated.View>

              </View>

              <View style={styles.divider} />

              {/* SIMPLIFIED ACTIVE TABLES LIST */}
              <Text style={[styles.sectionTitle, { color: colors.secondary, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }]}>
                Lista de Mesas Activas (En Servicio)
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
                  const tableOrder = orders.find(o => String(o.tableId) === String(table.id) && o.status !== 'entregado' && o.status !== 'cancelado');
                  const isReady = tableOrder && tableOrder.status === 'listo';
                  return (
                    <Animated.View
                      key={table.id}
                      style={[
                        styles.card,
                        {
                          backgroundColor: colors.cardBg,
                          borderColor: isReserved ? colors.warning : isReady ? greenGlowColor : colors.secondary,
                          borderWidth: isReserved ? 1.5 : isReady ? greenGlowWidth : 1.5,
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
                          <Animated.View style={{ backgroundColor: isReserved ? 'rgba(240, 173, 78, 0.15)' : table.waitingPayment ? 'rgba(220, 53, 69, 0.15)' : isReady ? greenGlowBg : 'rgba(141, 110, 99, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                            <Animated.Text style={{ fontSize: 11, fontWeight: 'bold', color: isReserved ? '#e68600' : table.waitingPayment ? '#dc3545' : isReady ? greenGlowColor : colors.secondary }}>
                              {isReserved ? 'Reservada' : table.waitingPayment ? 'Esperando Pago' : isReady ? 'Listo para Entregar' : 'En Servicio'}
                            </Animated.Text>
                          </Animated.View>
                        </View>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                          Zona: {table.zone}
                        </Text>
                      </View>

                      {isReserved ? (
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ color: colors.textMain, fontSize: 13 }}>
                            Reserva para: <Text style={{ fontWeight: 'bold' }}>{table.reservedFor}</Text>
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
                            <Text style={{ color: colors.secondary, fontWeight: 'bold', fontSize: 18, marginTop: 2 }}>
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
                              triggerAlertNotification(`${table.name} asignada a clientes.`);
                            }}
                          >
                            <Text style={styles.btnText}>Recibir Clientes</Text>
                          </ScaleInButton>
                        ) : (
                          <>
                            {(() => {
                              const tableOrder = orders.find(o => String(o.tableId) === String(table.id) && o.status !== 'entregado' && o.status !== 'cancelado');
                              const isReadyOrDelivered = !tableOrder || (tableOrder.status === 'listo' || tableOrder.status === 'entregado');
                              const isNotifyDisabled = table.waitingPayment || !isReadyOrDelivered;
                              return (
                                <>
                                  <ScaleInButton
                                    style={[styles.btn, { flex: 1, backgroundColor: table.waitingPayment ? '#9b8579' : colors.success, marginTop: 0, paddingVertical: 12 }]}
                                    disabled={table.waitingPayment}
                                    onPress={() => {
                                      setActiveTableId(table.id);
                                      setCurrentScreen('menu');
                                    }}
                                  >
                                    <Text style={styles.btnText}>Agregar Productos</Text>
                                  </ScaleInButton>

                                  <ScaleInButton
                                    style={[styles.btn, { flex: 1, backgroundColor: isNotifyDisabled ? '#728196' : colors.secondary, marginTop: 0, paddingVertical: 12 }]}
                                    disabled={isNotifyDisabled}
                                    onPress={() => {
                                      Alert.alert(
                                        'Notificar Cobro',
                                        `¿Estás seguro de que deseas notificar a Caja para cobrar la Mesa ${table.id}?`,
                                        [
                                          { text: 'Cancelar', style: 'cancel' },
                                          {
                                            text: 'Sí, notificar',
                                            onPress: () => {
                                              fetch(`${API_BASE_URL}/mesas/${table.id}/estado`, {
                                                method: 'PATCH',
                                                headers: {
                                                  'Content-Type': 'application/json',
                                                  'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({ estado: 'esperando_pago' })
                                              })
                                                .then(res => {
                                                  if (!res.ok) throw new Error('No se pudo notificar a caja.');
                                                  setTables(prevTables =>
                                                    prevTables.map(t => (t.id === table.id ? { ...t, waitingPayment: true } : t))
                                                  );
                                                  triggerAlertNotification(`Mesa ${table.id} notificada a Caja.`);
                                                })
                                                .catch(error => {
                                                  Alert.alert('Error', error.message || 'No se pudo conectar con el servidor.');
                                                });
                                            }
                                          }
                                        ]
                                      );
                                    }}
                                  >
                                    <Text style={styles.btnText}>{table.waitingPayment ? 'Esperando Pago' : 'Cobrar'}</Text>
                                  </ScaleInButton>
                                </>
                              );
                            })()}
                          </>
                        )}
                      </View>
                    </Animated.View>
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
                <Ionicons name="cart" size={18} color="#ffffff" />
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
                  Paso 3: Registra el pedido para la MESA {currentTable?.id || activeTableId}
                </Text>
              </View>

              <View style={[styles.searchBarContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Ionicons name="search" size={16} color={colors.textMuted} />
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
                    Orden: {menuSortOption === 'PriceAsc' ? '$ Menor' : menuSortOption === 'PriceDesc' ? '$ Mayor' : menuSortOption === 'NameAsc' ? 'A-Z' : 'Fila'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Main Categories */}
              <View style={{ height: 48, marginBottom: 12 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContainer}>
                  {['Todos', 'Bebidas Calientes', 'Frías', 'Postres', 'Desayunos'].map(cat => (
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
                            <Text style={[styles.tagBadgeText, { color: colors.primaryText }]}>{product.tag}</Text>
                          </View>
                        </View>
                        <Text style={[styles.productPrice, { color: colors.primaryText }]}>${product.price} MXN</Text>
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
                        <Text style={{ color: colors.primaryText, fontWeight: '600', fontSize: 13, textAlign: 'center' }}>Personalizar</Text>
                      </ScaleInButton>

                      {getProductQtyInCart(product.id) > 0 ? (
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', borderRadius: 8, borderWidth: 1, borderColor: colors.primary + '30', height: 44 }}>
                          <TouchableOpacity
                            style={{ padding: 10, flex: 1, alignItems: 'center' }}
                            onPress={() => handleQuickRemove(product)}
                          >
                            <Text style={{ color: colors.primaryText, fontWeight: 'bold', fontSize: 16 }}>-</Text>
                          </TouchableOpacity>
                          <Text style={{ color: colors.textMain, fontWeight: 'bold', fontSize: 14 }}>{getProductQtyInCart(product.id)}</Text>
                          <TouchableOpacity
                            style={{ padding: 10, flex: 1, alignItems: 'center' }}
                            onPress={() => handleQuickAdd(product)}
                          >
                            <Text style={{ color: colors.primaryText, fontWeight: 'bold', fontSize: 16 }}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <ScaleInButton
                          style={[styles.btn, { flex: 1, backgroundColor: colors.primary, marginTop: 0 }]}
                          onPress={() => handleQuickAdd(product)}
                        >
                          <Text style={[styles.btnText, { fontSize: 13 }]}>Agregar</Text>
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
                      Carrito ({currentCartList.reduce((acc, item) => acc + item.qty, 0)} items)
                    </Text>
                    <Text style={{ color: colors.primaryText, fontWeight: 'bold', fontSize: 13, marginTop: 2 }}>
                      Total: ${cartSubtotal} MXN
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: colors.success, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }]}
                    onPress={() => setCurrentScreen('summary')}
                  >
                    <Text style={[styles.btnText, { fontSize: 13, fontWeight: 'bold' }]}>
                      Ver Resumen
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
                  <Ionicons name="arrow-back" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={[styles.customizationDetails, { backgroundColor: colors.bg }]}>
                <View style={styles.customizationHeader}>
                  <Text style={[styles.customizationTitle, { color: colors.textMain }]}>{customizingProduct.name}</Text>
                  <Text style={[styles.customizationPriceText, { color: colors.primaryText }]}>+${customizingProduct.price}</Text>
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
                        <Text style={{ fontSize: 10, color: selectedMilk === milk ? '#ffffff' : colors.primaryText }}>
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
                      Extra Shot <Text style={{ color: colors.primaryText, fontSize: 12, fontWeight: 'bold' }}>+$12</Text>
                    </Text>
                    <View style={[styles.checkboxOutline, { borderColor: colors.border }, extraShot && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                      {extraShot && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => setSyrupVanilla(!syrupVanilla)}
                  >
                    <Text style={[styles.optionLabel, { color: colors.textMain }]}>
                      Sirope Vainilla <Text style={{ color: colors.primaryText, fontSize: 12, fontWeight: 'bold' }}>+$10</Text>
                    </Text>
                    <View style={[styles.checkboxOutline, { borderColor: colors.border }, syrupVanilla && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                      {syrupVanilla && <Ionicons name="checkmark" size={14} color="#ffffff" />}
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
                  <Text style={[styles.stepperBtnText, { color: colors.primaryText }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.stepperValue, { color: colors.textMain }]}>{customQty}</Text>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.bg }]}
                  onPress={() => setCustomQty(customQty + 1)}
                >
                  <Text style={[styles.stepperBtnText, { color: colors.primaryText }]}>+</Text>
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
            {renderHeader('Pedido / Mesa ' + activeTableId, `${partyCount} personas`, true)}

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              {/* STEP 4 GUIDED BANNER */}
              <View style={[styles.dashboardCard, { backgroundColor: colors.success, marginBottom: 12, paddingVertical: 12, paddingHorizontal: 16 }]}>
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>
                  Paso 4: Confirma la orden antes de enviarla
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.cardHeaderTitle, { color: colors.textMain, borderBottomColor: colors.border }]}>
                  Productos del Pedido ({currentCartList.reduce((acc, item) => acc + item.qty, 0)})
                </Text>

                {currentCartList.length === 0 ? (
                  <View style={{ paddingVertical: 32 }}>
                    <Text style={[styles.emptyCartText, { color: colors.textMuted }]}>El pedido está vacío.</Text>
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
                          {item.sentQty > 0 ? `\n(Ya enviado: ${item.sentQty})` : ''}
                        </Text>

                        <View style={styles.cartPriceStepper}>
                          <Text style={[styles.cartPriceText, { color: colors.primaryText }]}>${item.calculatedPrice.toFixed(2)}</Text>
                          <View style={styles.stepperActions}>
                            <TouchableOpacity
                              style={[styles.stepperBtnSmall, { backgroundColor: colors.bg }]}
                              onPress={() => {
                                setTableCarts(prev => {
                                  const list = [...prev[activeTableId]];
                                  const updatedItem = { ...list[idx] };
                                  const minQty = updatedItem.sentQty || 0;
                                  if (updatedItem.qty > minQty) {
                                    if (updatedItem.qty > 1) {
                                      updatedItem.qty -= 1;
                                      updatedItem.calculatedPrice = (updatedItem.calculatedPrice / (updatedItem.qty + 1)) * updatedItem.qty;
                                      list[idx] = updatedItem;
                                    } else {
                                      list.splice(idx, 1);
                                    }
                                    return { ...prev, [activeTableId]: list };
                                  } else {
                                    Alert.alert('Imposible Eliminar', 'Esta cantidad ya fue enviada a cocina.');
                                    return prev;
                                  }
                                });
                              }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primaryText }}>-</Text>
                            </TouchableOpacity>
                            <Text style={[styles.stepperValText, { color: colors.textMain }]}>{item.qty}</Text>
                            <TouchableOpacity
                              style={[styles.stepperBtnSmall, { backgroundColor: colors.bg }]}
                              onPress={() => {
                                setTableCarts(prev => {
                                  const list = [...prev[activeTableId]];
                                  const updatedItem = { ...list[idx] };
                                  if (!checkInventoryForProduct(updatedItem.product, 1)) {
                                    return prev;
                                  }
                                  updatedItem.qty += 1;
                                  updatedItem.calculatedPrice = (updatedItem.calculatedPrice / (updatedItem.qty - 1)) * updatedItem.qty;
                                  list[idx] = updatedItem;
                                  return { ...prev, [activeTableId]: list };
                                });
                              }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primaryText }}>+</Text>
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
                      <Text style={{ color: colors.primaryText, fontWeight: 'bold', fontSize: 16 }}>Total Pedido</Text>
                      <Text style={{ color: colors.primaryText, fontWeight: 'bold', fontSize: 18 }}>${cartTotal.toFixed(2)} MXN</Text>
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
                      <Text style={styles.btnText}>Enviar Pedido a Cocina</Text>
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
            {renderHeader('Mis Pedidos', 'Seguimiento de pedidos activos', true)}

            <View style={styles.contentContainer}>
              <View style={{ height: 42, marginBottom: 8 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContainer}>
                  {['Hoy', 'Ayer', 'Semana Pasada', 'Todos'].map(df => (
                    <TouchableOpacity
                      key={df}
                      style={[
                        styles.filterChip,
                        { borderColor: colors.border, backgroundColor: colors.cardBg },
                        dateFilter === df && { backgroundColor: colors.secondary, borderColor: colors.secondary }
                      ]}
                      onPress={() => setDateFilter(df)}
                    >
                      <Text style={[styles.chipText, { color: colors.textMuted }, dateFilter === df && { color: '#ffffff' }]}>
                        {df}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{ height: 42, marginBottom: 12 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContainer}>
                  {[
                    { label: 'Todas', value: 'Todos' },
                    { label: 'Pendientes', value: 'pendiente' },
                    { label: 'En Cocina', value: 'en_preparacion' },
                    { label: 'Listas', value: 'listo' },
                    { label: 'Entregadas', value: 'entregado' }
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
                    <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No hay pedidos activos en este estado.</Text>
                  </View>
                ) : (
                  filteredOrders.map(order => (
                    <OrderTrackingCard
                      key={order.id}
                      order={order}
                      colors={colors}
                      styles={styles}
                      onPress={() => {
                        setSelectedTrackingOrderId(order.id);
                        setCurrentScreen('details');
                      }}
                    />
                  ))
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
              const trackingOrder = orders.find(o => String(o.id) === String(selectedTrackingOrderId)) || {};
              let badgeColor = colors.info;
              let badgeText = 'En Preparación';
              if (trackingOrder.status === 'pendiente') {
                badgeColor = colors.warning;
                badgeText = 'Pendiente';
              } else if (trackingOrder.status === 'en_preparacion') {
                badgeColor = colors.info;
                badgeText = 'En Preparación';
              } else if (trackingOrder.status === 'listo') {
                badgeColor = colors.success;
                badgeText = 'Listo';
              } else if (trackingOrder.status === 'entregado') {
                badgeColor = '#6c5ce7';
                badgeText = 'Entregado';
              } else if (trackingOrder.status === 'cancelado') {
                badgeColor = colors.danger;
                badgeText = 'Cancelado';
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
                    <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Proceso en Cocina</Text>
                    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                      <View style={styles.timeline}>
                        <View style={styles.timelineItem}>
                          <View style={[styles.timelineDot, { backgroundColor: colors.success, borderColor: colors.success }]} />
                          <View style={styles.timelineContent}>
                            <Text style={[styles.timelineTitle, { color: colors.textMain }]}>Pedido recibido en Cocina</Text>
                            <Text style={[styles.timelineSubtitle, { color: colors.textMuted }]}>Pedido capturado y en fila.</Text>
                          </View>
                        </View>

                        <View style={styles.timelineItem}>
                          <View style={[
                            styles.timelineDot,
                            (trackingOrder.status === 'en_preparacion' || trackingOrder.status === 'listo' || trackingOrder.status === 'entregado') ?
                              { backgroundColor: colors.info, borderColor: colors.info } : { backgroundColor: colors.cardBg, borderColor: colors.border }
                          ]} />
                          <View style={styles.timelineContent}>
                            <Text style={[styles.timelineTitle, { color: trackingOrder.status !== 'pendiente' ? colors.info : colors.textMuted }]}>Preparando Platillos/Bebidas</Text>
                            <Text style={[styles.timelineSubtitle, { color: colors.textMuted }]}>El chef está procesando los ingredientes.</Text>
                          </View>
                        </View>

                        <View style={styles.timelineItem}>
                          <View style={[
                            styles.timelineDot,
                            (trackingOrder.status === 'listo' || trackingOrder.status === 'entregado') ?
                              { backgroundColor: colors.success, borderColor: colors.success } : { backgroundColor: colors.cardBg, borderColor: colors.border }
                          ]} />
                          <View style={styles.timelineContent}>
                            <Text style={[styles.timelineTitle, { color: (trackingOrder.status === 'listo' || trackingOrder.status === 'entregado') ? colors.success : colors.textMuted }]}>Listo en Barra (Para servir)</Text>
                            <Text style={[styles.timelineSubtitle, { color: colors.textMuted }]}>Pedido terminado y listo para entrega.</Text>
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
                              ${(item.calculatedPrice ?? (item.product ? (item.product.price * (item.qty ?? 1)) : 0)).toFixed(2)}
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

                    {trackingOrder.status !== 'entregado' && trackingOrder.status !== 'cancelado' && (
                      <TouchableOpacity
                        style={[
                          styles.btn,
                          trackingOrder.status !== 'listo' ?
                            { backgroundColor: colors.border } : { backgroundColor: colors.success }
                        ]}
                        disabled={trackingOrder.status !== 'listo'}
                        onPress={() => {
                          fetch(`${API_BASE_URL}/pedidos/${selectedTrackingOrderId}/estado`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              estado: 'entregado'
                            })
                          })
                            .then(res => {
                              if (!res.ok) {
                                return res.json().then(err => {
                                  throw new Error(err.error || 'No se pudo entregar el pedido.');
                                });
                              }
                              return res.json();
                            })
                            .then(() => {
                              setOrders(prev => {
                                const index = prev.findIndex(o => String(o.id) === String(selectedTrackingOrderId));
                                if (index === -1) return prev;
                                const updated = [...prev];
                                updated[index] = { ...updated[index], status: 'entregado' };
                                return updated;
                              });
                              Alert.alert('Pedido Entregado', 'Se ha marcado el pedido como entregado en mesa.');
                            })
                            .catch(err => Alert.alert('Error', err.message));
                        }}
                      >
                        <Text style={[styles.btnText, trackingOrder.status !== 'listo' && { color: colors.textMuted }]}>
                          Marcar como Entregado en Mesa
                        </Text>
                      </TouchableOpacity>
                    )}

                    {trackingOrder.status === 'pendiente' && (
                      <TouchableOpacity
                        style={[styles.btn, { backgroundColor: colors.danger, marginTop: 12 }]}
                        onPress={() => {
                          Alert.alert(
                            'Confirmar Cancelación',
                            '¿Estás seguro de que deseas cancelar este pedido? Se notificará a la cocina.',
                            [
                              { text: 'No, mantener pedido', style: 'cancel' },
                              {
                                text: 'Sí, cancelar pedido',
                                style: 'destructive',
                                onPress: () => {
                                  fetch(`${API_BASE_URL}/pedidos/${selectedTrackingOrderId}/estado`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                      estado: 'cancelado',
                                      comentario: 'Cancelado por el mesero'
                                    })
                                  })
                                    .then(res => {
                                      if (!res.ok) {
                                        return res.json().then(err => {
                                          throw new Error(err.error || 'No se pudo cancelar el pedido.');
                                        });
                                      }
                                      return res.json();
                                    })
                                    .then(() => {
                                      setOrders(prev => prev.map(o => String(o.id) === String(selectedTrackingOrderId) ? { ...o, status: 'cancelado' } : o));
                                      
                                      if (trackingOrder.tableId) {
                                        setTables(prevTables => prevTables.map(t => {
                                          if (String(t.id) === String(trackingOrder.tableId)) {
                                            const otherActiveOrders = orders.filter(o => 
                                              String(o.tableId) === String(trackingOrder.tableId) && 
                                              String(o.id) !== String(selectedTrackingOrderId) && 
                                              o.status !== 'cancelado' && 
                                              o.status !== 'entregado_pagado'
                                            );
                                            if (otherActiveOrders.length > 0) {
                                              const cancelledTotal = trackingOrder.total || 0;
                                              const newTotal = Math.max(0, (t.totalAccount || 0) - cancelledTotal);
                                              return { ...t, totalAccount: newTotal };
                                            } else {
                                              return { ...t, status: 'available', totalAccount: 0 };
                                            }
                                          }
                                          return t;
                                        }));
                                      }

                                      if (trackingOrder.items) {
                                        restockInventoryForOrder(trackingOrder.items);
                                      }

                                      if (trackingOrder.tableId && props.setTableCarts) {
                                        props.setTableCarts(prevCarts => {
                                          const updated = { ...prevCarts };
                                          if (updated[trackingOrder.tableId]) {
                                            const cancelledItems = trackingOrder.items || [];
                                            updated[trackingOrder.tableId] = updated[trackingOrder.tableId]
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
                                      }

                                      setNotificationHistory(prev => [
                                        {
                                          id: Math.random().toString(),
                                          type: 'kitchen',
                                          message: `Pedido #${trackingOrder.id} cancelado por el mesero.`,
                                          time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                                          read: false
                                        },
                                        ...prev
                                      ]);
                                      
                                      Alert.alert('Cancelado', 'El pedido se ha cancelado correctamente.');
                                      setCurrentScreen('tracking');
                                    })
                                    .catch(err => Alert.alert('Error al cancelar', err.message));
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <Text style={styles.btnText}>Cancelar Pedido</Text>
                      </TouchableOpacity>
                    )}
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
                <Text style={{ color: colors.primaryText, fontSize: 42, fontWeight: 'bold', marginVertical: 8 }}>
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
                  { name: 'Tarjeta de Credito/Debito', value: 'Tarjeta' },
                  { name: 'Efectivo en Caja', value: 'Efectivo' },
                  { name: 'Pago Dividido (Cuentas separadas)', value: 'Dividido' }
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
                  <Text style={{ color: colors.primaryText, fontWeight: 'bold', marginBottom: 4 }}>Información de Pago Dividido</Text>
                  <Text style={{ color: colors.textMain, fontSize: 13 }}>
                    Divide la cuenta equitativamente entre los comensales de la mesa.
                  </Text>
                  <Text style={{ color: colors.primaryText, fontWeight: '700', fontSize: 15, marginTop: 8 }}>
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
                  <Text style={styles.btnText}>Notificar Pedido Listo para Cobrar</Text>
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
                <Text style={{ color: colors.primaryText, fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 12 }}>
                  ${salesTotal.toFixed(2)} MXN
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                  Total correspondiente a {completedOrdersCount} pedidos finalizados hoy.
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Ventas por Hora</Text>
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingVertical: 20 }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
                  <View style={[styles.chartContainer, { gap: 16 }]}>
                    {stats.hourlyStats.map(bar => (
                      <View key={bar.hour} style={[styles.chartCol, { width: 50, alignItems: 'center' }]}>
                        <Text style={{ fontSize: 9, color: colors.textMuted, marginBottom: 4 }}>${bar.val}</Text>
                        <View style={[styles.chartBar, { height: bar.height, width: 14, borderRadius: 7, backgroundColor: colors.primary }]} />
                        <Text style={{ fontSize: 10, color: colors.textMain, marginTop: 6 }}>{bar.hour}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
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
                        {item.type === 'kitchen' ? 'Cocina' : 'Sistema'}
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
        {/* --- SCREEN: RESERVATIONS --- */}
        {currentScreen === 'reservations' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Reservar Mesa', 'Apartar mesas del local', true)}
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.formCard}>
                <Text style={[styles.sectionTitle, { color: colors.secondary, marginBottom: 12 }]}>
                  Nueva Reservación
                </Text>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Nombre Completo (Obligatorio)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                    placeholder="Ej. Juan Pérez García"
                    placeholderTextColor={colors.textMuted}
                    value={reserveName}
                    onChangeText={text => setReserveName(text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Teléfono</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                    placeholder="Ej. 4421234567 (10 dígitos)"
                    placeholderTextColor={colors.textMuted}
                    value={reservePhone}
                    onChangeText={text => setReservePhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Fecha (Día)</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                      placeholder="AAAA/MM/DD (ej: 2026/07/24)"
                      placeholderTextColor={colors.textMuted}
                      value={reserveDate}
                      onChangeText={handleDateChange}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Hora</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]}
                      placeholder="HH:MM (ej: 18:30)"
                      placeholderTextColor={colors.textMuted}
                      value={reserveTime}
                      onChangeText={handleTimeChange}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Selecciona Mesa Disponible</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 }}>
                    {tables.map(table => {
                      const isSelected = reserveTableId === table.id;
                      const isAvailable = table.status === 'available';
                      return (
                        <TouchableOpacity
                          key={table.id}
                          style={[
                            styles.tagFilterChip,
                            { paddingVertical: 10, paddingHorizontal: 16, borderColor: colors.border, backgroundColor: colors.bg, borderWidth: 1 },
                            !isAvailable && { opacity: 0.5, backgroundColor: colors.border },
                            isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                          ]}
                          disabled={!isAvailable}
                          onPress={() => setReserveTableId(table.id)}
                        >
                          <Text style={{ fontWeight: 'bold', fontSize: 13, color: isSelected ? '#ffffff' : (!isAvailable ? colors.textMuted : colors.textMain) }}>
                            {table.name} ({table.capacity} pax)
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.success, marginTop: 16 }]}
                  onPress={() => {
                    const cleanedPhone = reservePhone.trim();
                    const cleanedName = reserveName.trim();
                    const cleanedDate = reserveDate.trim();
                    const cleanedTime = reserveTime.trim();
                    
                    if (!cleanedName || !cleanedPhone || !cleanedDate || !cleanedTime || !reserveTableId) {
                      Alert.alert('Datos incompletos', 'Por favor, llena todos los campos y selecciona una mesa.');
                      return;
                    }

                    // Enforce full name (at least name and last name)
                    const wordsCount = cleanedName.split(/\s+/).filter(w => w.length > 0).length;
                    if (wordsCount < 2) {
                      Alert.alert('Nombre Completo Obligatorio', 'Por favor ingresa tu nombre completo (nombre y al menos un apellido).');
                      return;
                    }

                    // Validate phone number format (exactly 10 digits)
                    const phoneRegex = /^\d{10}$/;
                    if (!phoneRegex.test(cleanedPhone)) {
                      Alert.alert('Teléfono Inválido', 'Por favor ingresa un número de teléfono de 10 dígitos (ej: 4421234567).');
                      return;
                    }

                    // Validate date format (YYYY/MM/DD)
                    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
                    if (!dateRegex.test(cleanedDate)) {
                      Alert.alert('Fecha Inválida', 'Por favor ingresa la fecha en formato AAAA/MM/DD (ej: 2026/07/24).');
                      return;
                    }

                    // Validate time format (HH:MM in 24h format)
                    const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (!timeRegex.test(cleanedTime)) {
                      Alert.alert('Hora Inválida', 'Por favor ingresa la hora en formato de 24 horas HH:MM (ej: 18:30).');
                      return;
                    }

                    // Check if already reserved on this specific date
                    const exists = reservations.some(r => r.phone === cleanedPhone && r.date === cleanedDate);
                    if (exists) {
                      Alert.alert('Reserva denegada', `El cliente con este teléfono ya tiene una reservación activa para la fecha ${cleanedDate}.`);
                      return;
                    }

                    // Add reservation
                    const newRes = {
                      id: Date.now().toString(),
                      name: cleanedName,
                      phone: cleanedPhone,
                      tableId: reserveTableId,
                      date: cleanedDate,
                      time: cleanedTime
                    };

                    // Save reservation on backend database
                    fetch(`${API_BASE_URL}/reservaciones`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        nombre_cliente: cleanedName,
                        telefono: cleanedPhone,
                        id_mesa: reserveTableId,
                        fecha: cleanedDate,
                        hora: cleanedTime
                      })
                    })
                      .then(res => {
                        if (!res.ok) throw new Error('No se pudo guardar la reservación en el servidor.');
                        return res.json();
                      })
                      .then(() => {
                        setReservations(prev => [...prev, newRes]);
                        setTables(prevTables => prevTables.map(t => {
                          if (t.id === reserveTableId) {
                            return {
                              ...t,
                              status: 'reserved',
                              reservedFor: cleanedName,
                              time: `${cleanedDate} - ${cleanedTime}`,
                              note: `Tel: ${cleanedPhone}`
                            };
                          }
                          return t;
                        }));
                        Alert.alert('Éxito', `Mesa reservada para ${cleanedName} el ${cleanedDate} a las ${cleanedTime}.`);
                        setReserveName('');
                        setReservePhone('');
                        setReserveDate('');
                        setReserveTime('');
                        setReserveTableId(null);
                        setCurrentScreen('mesas');
                      })
                      .catch(error => {
                        Alert.alert('Error', error.message || 'No se pudo conectar con el servidor.');
                      });
                  }}
                >
                  <Text style={styles.btnText}>Confirmar Reservación</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ME'}
                  </Text>
                </View>
                <Text style={[styles.waiterName, { color: colors.textMain }]}>{currentUser?.name || 'Mesero'}</Text>
                <Text style={[styles.waiterRole, { color: colors.textMuted }]}>{currentUser?.role || 'Mesero'}</Text>

                <View style={[styles.shiftBadge, { backgroundColor: colors.success + '22' }]}>
                  <Text style={[styles.shiftBadgeText, { color: colors.success }]}>● Turno Activo</Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Panel de Turno</Text>
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.receiptRow}>
                  <Text style={{ color: colors.textMuted }}>Duración de Turno</Text>
                  <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{shiftTime}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={{ color: colors.textMuted }}>Pedidos entregados hoy</Text>
                  <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{completedOrdersCount}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={{ color: colors.textMuted }}>Mesas activas</Text>
                  <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{activeTablesCount}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: colors.primary, flex: 1, paddingVertical: 12 }]}
                    onPress={() => setCurrentScreen('statistics')}
                  >
                    <Text style={[styles.smallBtnText, { textAlign: 'center' }]}>Ver Reportes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: colors.primary, flex: 1, paddingVertical: 12 }]}
                    onPress={() => setCurrentScreen('notifications_history')}
                  >
                    <Text style={[styles.smallBtnText, { textAlign: 'center' }]}>Alertas</Text>
                  </TouchableOpacity>
                </View>

                {/* El turno del mesero dura lo que dura la sesión: cerrarla lo finaliza. */}
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.danger, marginTop: 12 }]}
                  onPress={() =>
                    confirmar(
                      'Finalizar jornada',
                      `Llevas ${shiftTime} en turno. Al finalizar se cerrará tu sesión.`,
                      handleLogout,
                      'Finalizar'
                    )
                  }
                >
                  <Text style={styles.btnText}>Finalizar Jornada</Text>
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
                <Text style={{ color: colors.primaryText, fontWeight: '600', textAlign: 'center' }}>Editar Datos Personales</Text>
              </TouchableOpacity>

              {motivationalMessage ? (
                <View style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 16,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}>
                  <Ionicons name="sparkles" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
                  <Text style={{
                    fontSize: 14,
                    color: colors.textMain,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    fontWeight: '600',
                    lineHeight: 20
                  }}>
                    "{motivationalMessage}"
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            {renderFooter('config')}
          </FadeInView>
        )}

        {currentScreen === 'edit_profile' && (
          <FadeInView style={{ flex: 1 }}>
            {renderHeader('Editar Perfil', 'Configuración de datos', true)}

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <View style={[styles.avatar, { backgroundColor: colors.secondary, position: 'relative' }]}>
                  <Text style={styles.avatarText}>
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ME'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary, marginBottom: 12 }]}>Datos Personales</Text>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Rol asignado</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.border, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 }}>
                  <Ionicons name="briefcase" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: 'transparent', color: colors.textMuted, borderHeight: 0, borderWidth: 0, paddingLeft: 0 }]}
                    value={currentUser?.role || 'Mesero'}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Nombre</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 }}>
                  <Ionicons name="person" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: 'transparent', color: colors.textMain, borderWidth: 0, paddingLeft: 0 }]}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Tu nombre"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Apellido Paterno</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 }}>
                  <Ionicons name="person" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: 'transparent', color: colors.textMain, borderWidth: 0, paddingLeft: 0 }]}
                    value={editLastNameP}
                    onChangeText={setEditLastNameP}
                    placeholder="Apellido Paterno"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Apellido Materno</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 }}>
                  <Ionicons name="person" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: 'transparent', color: colors.textMain, borderWidth: 0, paddingLeft: 0 }]}
                    value={editLastNameM}
                    onChangeText={setEditLastNameM}
                    placeholder="Apellido Materno"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Correo electrónico</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.border, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 }}>
                  <Ionicons name="mail" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: 'transparent', color: colors.textMuted, borderWidth: 0, paddingLeft: 0 }]}
                    value={editEmail}
                    editable={false}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Número de teléfono</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 }}>
                  <Ionicons name="call" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: 'transparent', color: colors.textMain, borderWidth: 0, paddingLeft: 0 }]}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                    placeholder="10 dígitos"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.secondary, marginTop: 16, marginBottom: 12 }]}>Seguridad</Text>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Nueva Contraseña</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 }}>
                  <Ionicons name="lock-closed" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: 'transparent', color: colors.textMain, borderWidth: 0, paddingLeft: 0 }]}
                    value={editPassword}
                    onChangeText={setEditPassword}
                    secureTextEntry
                    placeholder="Dejar vacío para no cambiar"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Confirmar Contraseña</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 }}>
                  <Ionicons name="lock-closed" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: 'transparent', color: colors.textMain, borderWidth: 0, paddingLeft: 0 }]}
                    value={editPassword2}
                    onChangeText={setEditPassword2}
                    secureTextEntry
                    placeholder="Confirmar nueva contraseña"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <TouchableOpacity 
                  style={[styles.btn, { flex: 1, backgroundColor: colors.border, marginTop: 0 }]} 
                  onPress={() => {
                    setEditName(currentUser?.name || '');
                    setEditLastNameP(currentUser?.lastNameP || '');
                    setEditLastNameM(currentUser?.lastNameM || '');
                    setEditEmail(currentUser?.email || '');
                    setEditPhone(currentUser?.phone || '');
                    setEditPassword('');
                    setEditPassword2('');
                    setCurrentScreen('config');
                  }}
                >
                  <Text style={[styles.btnText, { color: colors.textMain }]}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: colors.primary, marginTop: 0 }]} onPress={handleUpdateProfile}>
                  <Text style={styles.btnText}>Guardar</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#FF3B30', marginTop: 16, marginBottom: 40 }]}
                onPress={handleLogout}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>Cerrar Sesión</Text>
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
                      <Text style={{ color: colors.primaryText, fontSize: 12, fontWeight: '700' }}>
                        Zona: {selectedTableForDrawer.zone}
                      </Text>
                    </View>
                    <View style={[styles.tagBadge, { backgroundColor: colors.secondary + '15' }]}>
                      <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '700' }}>
                        Capacidad: {selectedTableForDrawer.capacity} comensales
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
                        <Text style={styles.btnText}>Abrir Mesa y Tomar Pedido</Text>
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
                        <Text style={styles.btnText}>Recibir Cliente e Iniciar Pedido</Text>
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
                          <Text style={{ color: colors.primaryText, fontWeight: 'bold' }}>Consumo acumulado:</Text>
                          <Text style={{ color: colors.primaryText, fontWeight: 'bold' }}>${selectedTableForDrawer.totalAccount?.toFixed(2)} MXN</Text>
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
                          <Text style={styles.btnText}>Agregar al Pedido / Menu</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            style={[styles.btn, { flex: 1, backgroundColor: colors.secondary }]}
                            onPress={() => {
                              setSelectedTableAction('Transfer');
                              setShowTableActionModal(true);
                            }}
                          >
                            <Text style={styles.btnText}>Mover Cuenta</Text>
                          </TouchableOpacity>
                          {(() => {
                            const tableOrder = orders.find(o => String(o.tableId) === String(selectedTableForDrawer.id) && o.status !== 'entregado' && o.status !== 'cancelado');
                            const isReadyOrDelivered = !tableOrder || (tableOrder.status === 'listo' || tableOrder.status === 'entregado');
                            const isNotifyDisabled = selectedTableForDrawer.waitingPayment || !isReadyOrDelivered;
                            return (
                              <TouchableOpacity
                                style={[styles.btn, { flex: 1, backgroundColor: isNotifyDisabled ? '#728196' : colors.primary }]}
                                disabled={isNotifyDisabled}
                                onPress={() => {
                                  Alert.alert(
                                    'Notificar Cobro',
                                    `¿Estás seguro de que deseas notificar a Caja para cobrar la Mesa ${selectedTableForDrawer.id}?`,
                                    [
                                      { text: 'Cancelar', style: 'cancel' },
                                      {
                                        text: 'Sí, notificar',
                                        onPress: () => {
                                          fetch(`${API_BASE_URL}/mesas/${selectedTableForDrawer.id}/estado`, {
                                            method: 'PATCH',
                                            headers: {
                                              'Content-Type': 'application/json',
                                              'Authorization': `Bearer ${token}`
                                              },
                                            body: JSON.stringify({ estado: 'esperando_pago' })
                                          })
                                            .then(res => {
                                              if (!res.ok) throw new Error('No se pudo notificar a caja.');
                                              setTables(prevTables =>
                                                prevTables.map(t => (t.id === selectedTableForDrawer.id ? { ...t, waitingPayment: true } : t))
                                              );
                                              setIsTableDetailDrawerVisible(false);
                                              triggerAlertNotification(`Mesa ${selectedTableForDrawer.id} notificada a Caja.`);
                                            })
                                            .catch(error => {
                                              Alert.alert('Error', error.message || 'No se pudo conectar con el servidor.');
                                            });
                                        }
                                      }
                                    ]
                                  );
                                }}
                              >
                                <Text style={styles.btnText}>{selectedTableForDrawer.waitingPayment ? 'Esperando Caja' : 'Cobrar'}</Text>
                              </TouchableOpacity>
                            );
                          })()}
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
                Recibir Clientes
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
                  console.log("WIZARD FILTER DEBUG:", {
                    zone,
                    wizardPartyCount,
                    partyType: typeof wizardPartyCount,
                    tablesList: tables.map(t => ({ name: t.name, status: t.status, capacity: t.capacity, capType: typeof t.capacity, zone: t.zone }))
                  });
                  const recommendedTables = tables.filter(t =>
                    t.status === 'available' &&
                    t.zone === zone &&
                    t.capacity >= wizardPartyCount
                  );

                  if (recommendedTables.length === 0) return null;

                  return (
                    <View key={zone} style={{ marginBottom: 12 }}>
                      <Text style={{ color: colors.textMain, fontWeight: 'bold', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Zona: {zone}
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
                              updateTableStatusOnBackend(table.id, 'ocupada');
                              setTables(prevTables =>
                                prevTables.map(t => (t.id === table.id ? { ...t, status: 'busy', occupants: `${wizardPartyCount}/${t.capacity}`, totalAccount: 0 } : t))
                              );
                              setActiveTableId(table.id);
                              setPartyCount(wizardPartyCount);
                              setActiveTablesCount(prev => prev + 1);
                              setShowReceptionWizard(false);
                              setCurrentScreen('menu');
                              triggerAlertNotification(`${table.name} asignada a ${wizardPartyCount} personas.`);
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
                      No hay mesas disponibles con esa capacidad.
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
              {/* Profile card at the top */}
              <View style={{ marginBottom: 20, alignItems: 'center', marginTop: 10 }}>
                <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 }}>
                  <Ionicons name="person" size={32} color="#ffffff" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }}>
                  {currentUser ? `${currentUser.name} ${currentUser.lastNameP || ''}`.trim() : 'Mesero Activo'}
                </Text>
                <Text style={{ fontSize: 12, color: colors.accent, marginTop: 3, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Módulo de Servicio
                </Text>
              </View>

              <View style={styles.sidebarSectionDivider} />

              <TouchableOpacity 
                style={[styles.sidebarLink, currentScreen === 'mesas' && { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }]} 
                onPress={() => { toggleSidebar(false); setCurrentScreen('mesas'); }}
              >
                <Ionicons name="grid-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={styles.sidebarLinkLabel}>Control Mesas</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarLink, currentScreen === 'menu' && { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }]} 
                onPress={() => { toggleSidebar(false); setCurrentScreen('menu'); }}
              >
                <Ionicons name="cafe-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={styles.sidebarLinkLabel}>Catálogo de Menú</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarLink, currentScreen === 'tracking' && { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }]} 
                onPress={() => { toggleSidebar(false); setCurrentScreen('tracking'); }}
              >
                <Ionicons name="time-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={styles.sidebarLinkLabel}>Seguimiento Cocina</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarLink, currentScreen === 'reservations' && { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }]} 
                onPress={() => { toggleSidebar(false); setCurrentScreen('reservations'); }}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={styles.sidebarLinkLabel}>Reservar Mesa</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarLink, currentScreen === 'statistics' && { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }]} 
                onPress={() => { toggleSidebar(false); setCurrentScreen('statistics'); }}
              >
                <Ionicons name="bar-chart-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={styles.sidebarLinkLabel}>Reportes de Ventas</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarLink, currentScreen === 'config' && { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }]} 
                onPress={() => { toggleSidebar(false); setCurrentScreen('config'); }}
              >
                <Ionicons name="settings-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={styles.sidebarLinkLabel}>Ajustes y Turno</Text>
              </TouchableOpacity>

              <View style={styles.sidebarFooter}>
                <TouchableOpacity style={styles.sidebarLogoutBtn} onPress={handleLogout}>
                  <Text style={styles.sidebarLogoutBtnText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <TouchableOpacity
              style={styles.sidebarCloseOverlay}
              onPress={() => toggleSidebar(false)}
            />
          </View>
        </Modal>

        {/* --- MODAL / BOTTOM SHEET FOR READY NOTIFICATION --- */}
        <Modal
          visible={showReadyModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowReadyModal(false)}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <TouchableOpacity 
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
              activeOpacity={1} 
              onPress={() => setShowReadyModal(false)} 
            />
            <View style={{ backgroundColor: colors.cardBg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, width: '100%' }}>
              <View style={{ width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 20 }} />
              
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <View style={{ backgroundColor: '#E8F5E9', padding: 16, borderRadius: 50, marginBottom: 12 }}>
                  <Ionicons name="cafe" size={36} color={colors.success} />
                </View>
                <Text style={[styles.modalTitleText, { color: colors.textMain, textAlign: 'center', fontSize: 20 }]}>¡Pedido Listo en Barra!</Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                  El pedido del cliente ya puede ser servido.
                </Text>
              </View>

              {activeReadyOrder && (
                <View style={{ backgroundColor: colors.bg, padding: 16, borderRadius: 16, marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ color: colors.textMain, fontWeight: 'bold', fontSize: 16 }}>Pedido #{activeReadyOrder.id}</Text>
                    <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>{activeReadyOrder.tableName || activeReadyOrder.table || 'Mesa'}</Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>Productos a entregar:</Text>
                  {((activeReadyOrder.items || activeReadyOrder.products) || []).map((item, idx) => (
                    <Text key={idx} style={{ color: colors.textMain, fontSize: 14, marginLeft: 8, marginVertical: 2 }}>
                      • {item.product?.name || item.name} (x{item.qty})
                    </Text>
                  ))}
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={[styles.btn, { flex: 1, backgroundColor: colors.border, marginTop: 0 }]}
                  onPress={() => setShowReadyModal(false)}
                >
                  <Text style={[styles.btnText, { color: colors.textMain }]}>Entendido</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { flex: 1, backgroundColor: colors.primary, marginTop: 0 }]}
                  onPress={() => {
                    setShowReadyModal(false);
                    if (activeReadyOrder) {
                      setSelectedTrackingOrderId(activeReadyOrder.id);
                      setCurrentScreen('tracking');
                    }
                  }}
                >
                  <Text style={styles.btnText}>Ver en Mapa/Mesa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <AvisoModal aviso={aviso} onClose={cerrarAviso} />
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
    paddingTop: Platform.OS === 'ios' ? 44 : (RNStatusBar.currentHeight || 0) + 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  sidebarLinkLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
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
  bellButton: {
    padding: 6,
    position: 'relative'
  },
  badgeContainer: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    width: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  notificationBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 300,
    zIndex: 9999,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
