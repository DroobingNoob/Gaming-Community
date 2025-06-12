import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustIndicators from './components/TrustIndicators';
import Vouches from './components/Vouches';
import BestSellers from './components/BestSellers';
import Categories from './components/Categories';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import CartModal from './components/CartModal';
import WhatsAppButton from './components/WhatsAppButton';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: "Grand Theft Auto V Premium Edition",
      price: 19.99,
      quantity: 1,
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300"
    }
  ]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleCartClick = () => {
    setIsCartModalOpen(true);
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLoginClick={() => setIsLoginModalOpen(true)}
        onCartClick={handleCartClick}
        isLoggedIn={isLoggedIn}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      
      <main>
        <Hero />
        <TrustIndicators />
        <Vouches />
        <BestSellers />
        <Categories />
      </main>

      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <WhatsAppButton />
    </div>
  );
}

export default App;