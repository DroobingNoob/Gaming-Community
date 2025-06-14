import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import ProductPage from './components/ProductPage';
import AllGamesPage from './components/AllGamesPage';
import SubscriptionsPage from './components/SubscriptionsPage';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  platform: string;
  type: string;
}

interface Game {
  id: number;
  title: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  platform: string;
  discount: number;
  description: string;
  features: string[];
  systemRequirements: string[];
}

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'allgames' | 'subscriptions'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Game | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: "Grand Theft Auto V Premium Edition",
      price: 19.99,
      quantity: 1,
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      platform: "PS5",
      type: "Permanent"
    }
  ]);

  useEffect(() => {
    const handleViewAllGames = () => {
      setCurrentView('allgames');
      window.scrollTo(0, 0);
    };

    const handleViewSubscriptions = () => {
      setCurrentView('subscriptions');
      window.scrollTo(0, 0);
    };

    window.addEventListener('viewAllGames', handleViewAllGames);
    window.addEventListener('viewSubscriptions', handleViewSubscriptions);
    
    return () => {
      window.removeEventListener('viewAllGames', handleViewAllGames);
      window.removeEventListener('viewSubscriptions', handleViewSubscriptions);
    };
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleCartClick = () => {
    setIsCartModalOpen(true);
  };

  const handleGameClick = (game: Game) => {
    setSelectedProduct(game);
    setCurrentView('product');
    window.scrollTo(0, 0);
  };

  const handleViewAllGames = () => {
    setCurrentView('allgames');
    window.scrollTo(0, 0);
  };

  const handleViewSubscriptions = () => {
    setCurrentView('subscriptions');
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (product: Game, platform: string, type: string, price: number) => {
    const itemId = `${product.id}-${platform}-${type}`;
    const existingItem = cartItems.find(item => 
      item.id === product.id && 
      item.platform === platform && 
      item.type === type
    );
    
    if (existingItem) {
      setCartItems(items =>
        items.map(item =>
          item.id === product.id && item.platform === platform && item.type === type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newCartItem: CartItem = {
        id: product.id,
        title: product.title,
        price: price,
        quantity: 1,
        image: product.image,
        platform: platform,
        type: type
      };
      setCartItems(items => [...items, newCartItem]);
    }
    
    // Show success toast
    toast.success(`${product.title} added to cart!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (section: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setSelectedProduct(null);
      setTimeout(() => {
        scrollToSection(section);
      }, 100);
    } else {
      scrollToSection(section);
    }
  };

  if (currentView === 'product' && selectedProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigation={handleNavigation}
        />
        
        <ProductPage
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onBackToHome={handleBackToHome}
          onGameClick={handleGameClick}
        />

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
        <ToastContainer />
      </div>
    );
  }

  if (currentView === 'allgames') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigation={handleNavigation}
        />
        
        <AllGamesPage
          onGameClick={handleGameClick}
          onBackToHome={handleBackToHome}
        />

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
        <ToastContainer />
      </div>
    );
  }

  if (currentView === 'subscriptions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigation={handleNavigation}
        />
        
        <SubscriptionsPage
          onGameClick={handleGameClick}
          onBackToHome={handleBackToHome}
        />

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
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <Header
        onLoginClick={() => setIsLoginModalOpen(true)}
        onCartClick={handleCartClick}
        isLoggedIn={isLoggedIn}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onNavigation={handleNavigation}
      />
      
      <main>
        <Hero onShopBestsellers={() => scrollToSection('bestsellers')} onBrowseCategories={() => scrollToSection('categories')} />
        <TrustIndicators />
        <Vouches />
        <div id="bestsellers">
          <BestSellers onGameClick={handleGameClick} />
        </div>
        <div id="categories">
          <Categories onViewAllGames={handleViewAllGames} onViewSubscriptions={handleViewSubscriptions} />
        </div>
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
      <ToastContainer />
    </div>
  );
}

export default App;