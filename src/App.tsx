import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FlashSaleStrip from './components/FlashSaleStrip';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import WhatsAppButton from './components/WhatsAppButton';

// Page Components
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ProductPage from './pages/ProductPage';
import AdminPage from './pages/AdminPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import FAQPage from './pages/FAQPage';

import { Game, supabase } from './config/supabase';
import { CartStorageService } from './services/cartStorageService';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  platform: string;
  type: string;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track if we've already shown login toast to prevent duplicates
  const hasShownLoginToast = useRef(false);
  const hasShownLogoutToast = useRef(false);

  // Load cart from Google Sheets when user logs in
  const loadUserCart = async (userId: string) => {
    try {
      const savedCartItems = await CartStorageService.loadCartItems(userId);
      if (savedCartItems.length > 0) {
        setCartItems(savedCartItems);
        toast.info(`Welcome back! Your cart has ${savedCartItems.length} items.`);
      }
    } catch (error) {
      console.error('Error loading user cart:', error);
    }
  };

  // Save cart to Google Sheets when cart changes (for logged-in users)
  const saveUserCart = async (userId: string, items: CartItem[]) => {
    try {
      await CartStorageService.saveCartItems(userId, items);
    } catch (error) {
      console.error('Error saving user cart:', error);
    }
  };

  // Check authentication status on app load
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
        // Check if user is admin (you can customize this logic)
        setIsAdmin(session.user.email === 'communitygamiing1@gmail.com' || session.user.user_metadata?.role === 'admin');
        
        // Load user's cart from Google Sheets
        loadUserCart(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
        // Check if user is admin (you can customize this logic)
        setIsAdmin(session.user.email === 'communitygamiing1@gmail.com' || session.user.user_metadata?.role === 'admin');
        
        if (event === 'SIGNED_IN' && !hasShownLoginToast.current) {
          toast.success('Successfully signed in!');
          setIsLoginModalOpen(false);
          hasShownLoginToast.current = true;
          
          // Load user's cart from Google Sheets
          loadUserCart(session.user.id);
          
          // Reset after a delay to allow future logins
          setTimeout(() => {
            hasShownLoginToast.current = false;
          }, 5000);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
        
        // Clear cart when user logs out
        setCartItems([]);
        
        if (event === 'SIGNED_OUT' && !hasShownLogoutToast.current) {
          toast.success('Successfully signed out!');
          hasShownLogoutToast.current = true;
          // Reset after a delay to allow future logouts
          setTimeout(() => {
            hasShownLogoutToast.current = false;
          }, 5000);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save cart to Google Sheets whenever cart changes (for logged-in users)
  useEffect(() => {
    if (isLoggedIn && user && cartItems.length >= 0) {
      // Debounce the save operation to avoid too many requests
      const timeoutId = setTimeout(() => {
        saveUserCart(user.id, cartItems);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [cartItems, isLoggedIn, user]);

  const handleLogin = () => {
    // This will be handled by the auth state change listener
    setIsLoginModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Clear cart from Google Sheets before logging out
      if (user) {
        await CartStorageService.clearCart(user.id);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error signing out: ' + error.message);
      }
    } catch (error) {
      toast.error('An error occurred during sign out');
      console.error('Logout error:', error);
    }
  };

  const handleCartClick = () => {
    setIsCartModalOpen(true);
  };

  const handleCheckout = () => {
    try {
      if (cartItems.length === 0) {
        toast.error('Your cart is empty');
        return;
      }
      setIsCartModalOpen(false);
      setIsCheckoutModalOpen(true);
    } catch (error) {
      console.error('Error opening checkout:', error);
      toast.error('Failed to open checkout. Please try again.');
    }
  };

  const handleOrderComplete = async () => {
    try {
      // Clear cart after successful order
      if (isLoggedIn && user) {
        await CartStorageService.clearCart(user.id);
      }
      setCartItems([]);
      toast.success('Order placed successfully! You will receive your games within 15 minutes.');
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Order completed but there was an issue clearing the cart.');
    }
  };

  const handleNavigation = (section: string) => {
    try {
      if (section === 'admin' && isAdmin) {
        navigate('/admin');
        return;
      }

      if (section === 'logout' && isLoggedIn) {
        handleLogout();
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
        navigate('/terms');
        return;
      }

      if (section === 'refund') {
        navigate('/refund-policy');
        return;
      }

      if (section === 'faq') {
        navigate('/faq');
        return;
      }

      if (section === 'home') {
        navigate('/');
        return;
      }

      if (section === 'categories') {
        // Scroll to categories section on home page
        if (location.pathname !== '/') {
          navigate('/');
          setTimeout(() => {
            scrollToSection('categories');
          }, 100);
        } else {
          scrollToSection('categories');
        }
        return;
      }
      
      // For other sections, scroll to them if on home page
      if (location.pathname === '/') {
        scrollToSection(section);
      } else {
        navigate('/');
        setTimeout(() => {
          scrollToSection(section);
        }, 100);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Navigation failed. Please try again.');
    }
  };

  const scrollToSection = (sectionId: string) => {
    try {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Scroll error:', error);
    }
  };

  const handleAddToCart = (product: Game, platform: string, type: string, price: number) => {
    try {
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
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const handleBuyNow = (product: Game, platform: string, type: string, price: number) => {
    try {
      // Add to cart first
      handleAddToCart(product, platform, type, price);
      
      // Open checkout modal
      setTimeout(() => {
        setIsCheckoutModalOpen(true);
      }, 500);
      
      toast.success('Redirecting to checkout!');
    } catch (error) {
      console.error('Error in buy now:', error);
      toast.error('Failed to proceed to checkout. Please try again.');
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    try {
      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = (id: string) => {
    try {
      setCartItems(items => items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        {/* Flash Sale Strip - At the very top with highest z-index */}
        <FlashSaleStrip />

        {/* Header - Immediately below Flash Sale Strip */}
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigation={handleNavigation}
          user={user}
        />

        {/* Main content - Below header with proper spacing */}
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage onNavigation={handleNavigation} />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/:id" element={<ProductPage onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/subscriptions/:id" element={<ProductPage onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />} />
            <Route path="/admin" element={isAdmin ? <AdminPage /> : <HomePage onNavigation={handleNavigation} />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer onNavigation={handleNavigation} />

        {/* Modals - High z-index */}
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
          onCheckout={handleCheckout}
        />

        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          cartItems={cartItems}
          onOrderComplete={handleOrderComplete}
        />

        {/* WhatsApp Button */}
        <WhatsAppButton />
        
        {/* Toast Container */}
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;