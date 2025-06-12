import React, { useState, useEffect } from 'react';
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

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface Game {
  id: number;
  title: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  rating: number;
  platform: string;
  discount: number;
  description: string;
  features: string[];
  systemRequirements: string[];
}

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'allgames'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Game | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: "Grand Theft Auto V Premium Edition",
      price: 19.99,
      quantity: 1,
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400"
    }
  ]);

  useEffect(() => {
    const handleViewAllGames = () => {
      setCurrentView('allgames');
    };

    window.addEventListener('viewAllGames', handleViewAllGames);
    return () => window.removeEventListener('viewAllGames', handleViewAllGames);
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
  };

  const handleViewAllGames = () => {
    setCurrentView('allgames');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProduct(null);
  };

  const handleAddToCart = (product: Game) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(items =>
        items.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newCartItem: CartItem = {
        id: product.id,
        title: product.title,
        price: product.salePrice,
        quantity: 1,
        image: product.image
      };
      setCartItems(items => [...items, newCartItem]);
    }
    
    // Show success message or animation here
    alert('Added to cart!');
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

  if (currentView === 'product' && selectedProduct) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        />
        
        {/* Blue Strip */}
        <div className="bg-cyan-400 text-white py-2">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm md:text-base font-medium">
              🕹️ Trusted by Top Streamers and Gamers – Shop the Same Games They Play!
            </p>
          </div>
        </div>

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
      </div>
    );
  }

  if (currentView === 'allgames') {
    return (
      <div className="min-h-screen bg-white">
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        />
        
        {/* Blue Strip */}
        <div className="bg-cyan-400 text-white py-2">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm md:text-base font-medium">
              🕹️ Trusted by Top Streamers and Gamers – Shop the Same Games They Play!
            </p>
          </div>
        </div>

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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLoginClick={() => setIsLoginModalOpen(true)}
        onCartClick={handleCartClick}
        isLoggedIn={isLoggedIn}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      
      <main>
        <Hero onShopBestsellers={() => scrollToSection('bestsellers')} onBrowseCategories={() => scrollToSection('categories')} />
        <TrustIndicators />
        <Vouches />
        <div id="bestsellers">
          <BestSellers onGameClick={handleGameClick} />
        </div>
        <div id="categories">
          <Categories />
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
    </div>
  );
}

export default App;