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
import AdminPage from './components/AdminPage';
import TermsPage from './components/TermsPage';
import RefundPolicyPage from './components/RefundPolicyPage';
import { Game } from './config/supabase';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  platform: string;
  type: string;
}

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'allgames' | 'subscriptions' | 'admin' | 'terms' | 'refund'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Game | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Set to true for demo - in real app check user role
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

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

  const handleViewAdmin = () => {
    setCurrentView('admin');
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (product: Game, platform: string, type: string, price: number) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      setIsLoginModalOpen(true);
      return;
    }

    const itemId = `${product.id}-${platform}-${type}`;
    const existingItem = cartItems.find(item => item.id === itemId);
    
    if (existingItem) {
      setCartItems(items =>
        items.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newCartItem: CartItem = {
        id: itemId,
        title: product.title,
        price: price,
        quantity: 1,
        image: product.image,
        platform: platform,
        type: type
      };
      setCartItems(items => [...items, newCartItem]);
    }
    
    toast.success(`${product.title} added to cart!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleBuyNow = (product: Game, platform: string, type: string, price: number) => {
    if (!isLoggedIn) {
      toast.error('Please login to purchase');
      setIsLoginModalOpen(true);
      return;
    }

    // Add to cart first
    handleAddToCart(product, platform, type, price);
    
    // Open WhatsApp for purchase
    const phoneNumber = '9266514434';
    const message = `Hi! I want to buy ${product.title} for ${platform} (${type}) - ₹${price}. Please help me complete the purchase.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Redirecting to WhatsApp for purchase completion!');
  };

  const handleToggleWishlist = (productId: string) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to wishlist');
      setIsLoginModalOpen(true);
      return;
    }

    if (wishlistItems.includes(productId)) {
      setWishlistItems(items => items.filter(id => id !== productId));
      toast.success('Removed from wishlist');
    } else {
      setWishlistItems(items => [...items, productId]);
      toast.success('Added to wishlist');
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (section: string) => {
    if (section === 'admin' && isAdmin) {
      handleViewAdmin();
      return;
    }

    if (section === 'contact') {
      // Open WhatsApp for contact
      const phoneNumber = '9266514434';
      const message = 'Hi! I need help with my gaming purchase.';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

    if (section === 'terms') {
      setCurrentView('terms');
      window.scrollTo(0, 0);
      return;
    }

    if (section === 'refund') {
      setCurrentView('refund');
      window.scrollTo(0, 0);
      return;
    }
    
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

  if (currentView === 'terms') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigation={handleNavigation}
        />
        
        <TermsPage onBackToHome={handleBackToHome} />

        <Footer onNavigation={handleNavigation} />

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

  if (currentView === 'refund') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigation={handleNavigation}
        />
        
        <RefundPolicyPage onBackToHome={handleBackToHome} />

        <Footer onNavigation={handleNavigation} />

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

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigation={handleNavigation}
        />
        
        <AdminPage onBackToHome={handleBackToHome} />

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

  if (currentView === 'product' && selectedProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigation={handleNavigation}
        />
        
        <ProductPage
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={wishlistItems.includes(selectedProduct.id || '')}
          isLoggedIn={isLoggedIn}
          onBackToHome={handleBackToHome}
          onGameClick={handleGameClick}
        />

        <Footer onNavigation={handleNavigation} />

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
          isAdmin={isAdmin}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigation={handleNavigation}
        />
        
        <AllGamesPage
          onGameClick={handleGameClick}
          onBackToHome={handleBackToHome}
        />

        <Footer onNavigation={handleNavigation} />

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
          isAdmin={isAdmin}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigation={handleNavigation}
        />
        
        <SubscriptionsPage
          onGameClick={handleGameClick}
          onBackToHome={handleBackToHome}
        />

        <Footer onNavigation={handleNavigation} />

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
        isAdmin={isAdmin}
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

      <Footer onNavigation={handleNavigation} />

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