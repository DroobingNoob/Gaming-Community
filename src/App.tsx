import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FlashSaleStrip from "./components/FlashSaleStrip";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import CartModal from "./components/CartModal";
import CheckoutModal from "./components/CheckoutModal";
import WhatsAppButton from "./components/WhatsAppButton";
import FloatingCartButton from "./components/FloatingCartButton";

// Page Components
import HomePage from "./pages/HomePage";
import GamesPage from "./pages/GamesPage";
import PCGamesPage from "./pages/PCGamesPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import ProductPage from "./pages/ProductPage";
import AdminPage from "./pages/AdminPage";
import TermsPage from "./pages/TermsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import FAQPage from "./pages/FAQPage";

import { Game } from "./config/supabase";
import { settingsService, ShopStatus } from "./services/settingsService";
import { authService, AdminUser } from "./services/authService";

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  platform: string;
  type: string;
  edition?: string;
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
    console.error("App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please refresh the page to try
              again.
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
  const [user, setUser] = useState<AdminUser | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hasNewsletterDiscount, setHasNewsletterDiscount] = useState(false);
  const [shopStatus, setShopStatus] = useState<ShopStatus>({
    isOpen: true,
    mode: "working_hours",
    message: "",
  });
    const [flyToCartAnimation, setFlyToCartAnimation] = useState<{
    image: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    key: number;
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const bootAuth = async () => {
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      const currentUser = await authService.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
        setIsAdmin(currentUser.role === "admin");
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    bootAuth();
  }, []);

  useEffect(() => {
    const fetchShopStatus = async () => {
      const status = await settingsService.getShopStatus();
      setShopStatus(status);
    };

    fetchShopStatus();

    const subscription = settingsService.subscribeToSettings(async () => {
      const status = await settingsService.getShopStatus();
      setShopStatus(status);
    });

    const interval = setInterval(fetchShopStatus, 60000000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleLogin = async () => {
    const currentUser = await authService.getCurrentUser();

    if (currentUser) {
      setUser(currentUser);
      setIsLoggedIn(true);
      setIsAdmin(currentUser.role === "admin");
      setIsLoginModalOpen(false);
      toast.success("Successfully signed in!");
    } else {
      toast.error("Login verification failed");
    }
  };

  const handleLogout = async () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/");
    toast.success("Successfully signed out!");
  };

  const handleCartClick = () => {
    setIsCartModalOpen(true);
  };

  const handleCheckout = () => {
    try {
      if (cartItems.length === 0) {
        toast.error("Your cart is empty");
        return;
      }
      setIsCartModalOpen(false);
      setIsCheckoutModalOpen(true);
    } catch (error) {
      console.error("Error opening checkout:", error);
      toast.error("Failed to open checkout. Please try again.");
    }
  };

  const handleOrderComplete = async () => {
    try {
      setCartItems([]);
      setHasNewsletterDiscount(false);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error("Order completed but there was an issue clearing the cart.");
    }
  };

  const handleNavigation = (section: string) => {
    try {
      if (section === "admin") {
        if (isAdmin) {
          navigate("/admin");
        } else {
          setIsLoginModalOpen(true);
          toast.info("Please log in as admin");
        }
        return;
      }

      if (section === "logout" && isLoggedIn) {
        handleLogout();
        return;
      }

      if (section === "contact") {
        const phoneNumber = "+91 9266514434";
        const message = "Hi! I need help with my gaming purchase.";
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        return;
      }

      if (section === "terms") {
        navigate("/terms");
        return;
      }

      if (section === "refund") {
        navigate("/refund-policy");
        return;
      }

      if (section === "faq") {
        navigate("/faq");
        return;
      }

      if (section === "home") {
        navigate("/");
        return;
      }

      if (section === "categories") {
        if (location.pathname !== "/") {
          navigate("/");
          setTimeout(() => {
            scrollToSection("categories");
          }, 100);
        } else {
          scrollToSection("categories");
        }
        return;
      }

      if (location.pathname === "/") {
        scrollToSection(section);
      } else {
        navigate("/");
        setTimeout(() => {
          scrollToSection(section);
        }, 100);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Navigation failed. Please try again.");
    }
  };

  const scrollToSection = (sectionId: string) => {
    try {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Scroll error:", error);
    }
  };

  const handleAddToCart = (
    product: Game,
    platform: string,
    type: string,
    price: number
  ) => {
    try {
      const itemId = `${product.id}-${platform}-${type}`;

      const now = Date.now();
      const lastAddTime = sessionStorage.getItem(`lastAdd_${itemId}`);
      if (lastAddTime && now - parseInt(lastAddTime) < 1000) {
        return;
      }
      sessionStorage.setItem(`lastAdd_${itemId}`, now.toString());

      const existingItem = cartItems.find((item) => item.id === itemId);

      if (existingItem) {
        if (existingItem.quantity >= 10) {
          toast.warning("Maximum quantity (10) reached for this item");
          return;
        }
        setCartItems((items) =>
          items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        const newCartItem: CartItem = {
          id: itemId,
          title: product.title,
          price,
          quantity: 1,
          image: product.image,
          platform,
          type,
          edition: product.edition,
        };
        setCartItems((items) => [...items, newCartItem]);
      }

      toast.success(`${product.title} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };

  const handleBuyNow = (
    product: Game,
    platform: string,
    type: string,
    price: number
  ) => {
    try {
      handleAddToCart(product, platform, type, price);

      setTimeout(() => {
        setIsCheckoutModalOpen(true);
      }, 500);

      toast.success("Redirecting to checkout!");
    } catch (error) {
      console.error("Error in buy now:", error);
      toast.error("Failed to proceed to checkout. Please try again.");
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    try {
      if (quantity < 1) {
        handleRemoveItem(id);
        return;
      }
      if (quantity > 10) {
        toast.warning("Maximum quantity (10) reached for this item");
        return;
      }

      setCartItems((items) =>
        items.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  const handleRemoveItem = (id: string) => {
    try {
      setCartItems((items) => items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item. Please try again.");
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const animateProductToCart = () => {
    return new Promise<void>((resolve) => {
      try {
        const productImage = document.getElementById("product-main-image") as HTMLImageElement | null;
        const cartButton = document.getElementById("floating-cart-button");

        if (!productImage || !cartButton) {
          resolve();
          return;
        }

        const imageRect = productImage.getBoundingClientRect();
        const cartRect = cartButton.getBoundingClientRect();

        const startX = imageRect.left + imageRect.width / 2 - 40;
        const startY = imageRect.top + imageRect.height / 2 - 40;
        const endX = cartRect.left + cartRect.width / 2 - 20;
        const endY = cartRect.top + cartRect.height / 2 - 20;

        setFlyToCartAnimation({
          image: productImage.src,
          startX,
          startY,
          endX,
          endY,
          key: Date.now(),
        });
                cartButton.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.18)" },
            { transform: "scale(0.95)" },
            { transform: "scale(1)" },
          ],
          {
            duration: 450,
            delay: 420,
            easing: "ease-out",
          }
        );

        setTimeout(() => {
          setFlyToCartAnimation(null);
          resolve();
        }, 800);
      } catch (error) {
        console.error("Fly to cart animation error:", error);
        resolve();
      }
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <FlashSaleStrip />

        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={handleCartClick}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          cartItemCount={cartItemCount}
          onNavigation={handleNavigation}
          user={user}
          hasNewsletterDiscount={hasNewsletterDiscount}
        />

        <main className="relative z-10">
          <Routes>
            <Route
              path="/"
              element={<HomePage onNavigation={handleNavigation} />}
            />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/pc-games" element={<PCGamesPage />} />
            <Route
              path="/games/:id"
              element={
                <ProductPage
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onAnimateToCart={animateProductToCart}
                />
              }
            />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route
              path="/subscriptions/:id"
              element={
                <ProductPage
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onAnimateToCart={animateProductToCart}
                />
              }
            />
            <Route
              path="/admin"
              element={isAdmin ? <AdminPage /> : <HomePage onNavigation={handleNavigation} />}
            />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Routes>
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
          onCheckout={handleCheckout}
        />

        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          cartItems={cartItems}
          onOrderComplete={handleOrderComplete}
          hasNewsletterDiscount={hasNewsletterDiscount}
          user={user}
          isShopOpen={shopStatus.isOpen}
          shopClosedMessage={shopStatus.message}
          shopWorkingHours={shopStatus.workingHours}
        />

        <FloatingCartButton
          cartItemCount={cartItemCount}
          onCartClick={handleCartClick}
        />

        <WhatsAppButton />
                {flyToCartAnimation &&
          createPortal(
            <>
              <style>
                {`
                  @keyframes flyToCartAnimation {
                    0% {
                      transform: translate(0, 0) scale(1);
                      opacity: 1;
                    }
                    60% {
                      opacity: 1;
                    }
                    100% {
                      transform: translate(
                        calc(var(--fly-x-end) - var(--fly-x-start)),
                        calc(var(--fly-y-end) - var(--fly-y-start))
                      ) scale(0.2);
                      opacity: 0.2;
                    }
                  }

                  @keyframes cartBounceAnimation {
                    0% { transform: scale(1); }
                    30% { transform: scale(1.2); }
                    60% { transform: scale(0.92); }
                    100% { transform: scale(1); }
                  }
                `}
              </style>

              <div
                key={flyToCartAnimation.key}
                className="pointer-events-none fixed z-[9999] rounded-2xl overflow-hidden shadow-2xl border border-white/60"
                style={
                  {
                    left: `${flyToCartAnimation.startX}px`,
                    top: `${flyToCartAnimation.startY}px`,
                    width: "80px",
                    height: "80px",
                    "--fly-x-start": `${flyToCartAnimation.startX}px`,
                    "--fly-y-start": `${flyToCartAnimation.startY}px`,
                    "--fly-x-end": `${flyToCartAnimation.endX}px`,
                    "--fly-y-end": `${flyToCartAnimation.endY}px`,
                    animation:
                      "flyToCartAnimation 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                  } as React.CSSProperties
                }
              >
                <img
                  src={flyToCartAnimation.image}
                  alt="Flying product"
                  className="w-full h-full object-cover"
                />
              </div>
            </>,
            document.body
          )}
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;