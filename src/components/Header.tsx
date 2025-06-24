import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Shield, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGames, useSubscriptions } from '../hooks/useSupabaseData';
import { Game } from '../config/supabase';

interface HeaderProps {
  onLoginClick: () => void;
  onCartClick: () => void;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  cartItemCount: number;
  onNavigation: (section: string) => void;
  user?: any;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onCartClick, isLoggedIn, isAdmin, cartItemCount, onNavigation, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Game[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { games } = useGames();
  const { subscriptions } = useSubscriptions();

  // Combine games and subscriptions for search
  const allItems = [...games, ...subscriptions];

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = allItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allItems]);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (item: Game) => {
    setSearchQuery('');
    setShowSuggestions(false);
    setIsSearchExpanded(false);
    
    // Navigate to the appropriate page based on item category
    if (item.category === 'game') {
      navigate(`/games/${item.id}`);
    } else {
      navigate(`/subscriptions/${item.id}`);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to all games page with search query
      navigate('/games');
      setIsSearchExpanded(false);
    }
  };

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Categories', id: 'categories' },
    { name: 'FAQ', id: 'faq' },
    { name: 'Contact', id: 'contact' }
  ];

  // Add admin option if user is admin
  if (isAdmin) {
    navItems.push({ name: 'Admin', id: 'admin' });
  }

  const handleNavClick = (itemId: string) => {
    if (itemId === 'home') {
      navigate('/');
    } else if (itemId === 'contact') {
      // Open WhatsApp for contact
      const phoneNumber = '9266514434';
      const message = 'Hi! I need help with my gaming purchase.';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      onNavigation(itemId);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-md relative z-40">
        {!isSearchExpanded ? (
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            {/* Desktop Header */}
            <div className="hidden lg:block">
              {/* Top row with search icon, logo, and auth/cart */}
              <div className="flex items-center justify-between mb-4">
                {/* Search Icon */}
                <div className="flex-1">
                  <button
                    onClick={handleSearchClick}
                    className="text-cyan-600 hover:text-orange-500 transition-colors p-2"
                  >
                    <Search className="w-6 h-6" />
                  </button>
                </div>

                {/* Logo - Made Much More Prominent */}
                <div className="flex items-center justify-center">
                  <img 
                    src="/1000156095.jpg" 
                    alt="Gaming Community" 
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 object-contain hover:scale-105 transition-transform duration-300 shadow-lg rounded-xl cursor-pointer"
                    onClick={() => navigate('/')}
                  />
                </div>

                {/* Auth & Cart */}
                <div className="flex items-center space-x-4 flex-1 justify-end">
                  {isLoggedIn ? (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium text-sm">
                          {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigation('logout')}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={onLoginClick}
                      className="flex items-center space-x-2 px-4 py-2 text-cyan-600 hover:text-orange-500 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                  )}
                  
                  <button
                    onClick={onCartClick}
                    className="relative flex items-center space-x-2 px-4 py-2 text-cyan-600 hover:text-orange-500 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Cart</span>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex justify-center">
                <ul className="flex space-x-8">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`text-cyan-600 hover:text-orange-500 font-medium transition-colors py-2 flex items-center space-x-1 ${
                          item.id === 'admin' ? 'bg-gradient-to-r from-purple-100 to-indigo-100 px-3 rounded-full' : ''
                        }`}
                      >
                        {item.id === 'admin' && <Shield className="w-4 h-4" />}
                        <span>{item.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-cyan-600 p-1 z-50 relative"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Mobile Logo - Centered and Prominent */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <img 
                    src="/1000156095.jpg" 
                    alt="Gaming Community" 
                    className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 md:w-22 md:h-22 object-contain hover:scale-105 transition-transform duration-300 shadow-lg rounded-lg cursor-pointer"
                    onClick={() => navigate('/')}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button onClick={handleSearchClick} className="text-cyan-600 p-1">
                    <Search className="w-4 h-4" />
                  </button>
                  <button onClick={onCartClick} className="relative text-cyan-600 p-1">
                    <ShoppingCart className="w-4 h-4" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Menu */}
              {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40">
                  <div className="container mx-auto px-3 sm:px-4 py-4">
                    <nav className="space-y-2">
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`block w-full text-left py-3 px-2 text-cyan-600 hover:text-orange-500 transition-colors hover:bg-gray-50 rounded-lg flex items-center space-x-2 ${
                            item.id === 'admin' ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200' : ''
                          }`}
                        >
                          {item.id === 'admin' && <Shield className="w-4 h-4" />}
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </nav>
                    
                    {isLoggedIn ? (
                      <div className="mt-4 space-y-2">
                        <div className="py-3 px-2 text-green-600 bg-green-50 rounded-lg">
                          Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
                        </div>
                        <button
                          onClick={() => {
                            onNavigation('logout');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left py-3 px-2 text-red-600 hover:text-red-700 transition-colors hover:bg-red-50 rounded-lg flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          onLoginClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="mt-4 w-full text-left py-3 px-2 text-cyan-600 hover:text-orange-500 transition-colors hover:bg-gray-50 rounded-lg"
                      >
                        Login with Google
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Expanded Search */
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleSearchClose}
                className="text-cyan-600 hover:text-orange-500 transition-colors p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border-2 border-cyan-400 rounded-full focus:outline-none focus:border-orange-400 transition-colors text-sm sm:text-lg"
                  autoFocus
                />
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
                
                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-64 overflow-y-auto">
                    {searchSuggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{item.title}</div>
                          <div className="text-sm text-gray-500">
                            ₹{item.category === 'game' ? item.rent_1_month || item.original_price : item.sale_price} • {item.platform.join(', ')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={handleSearch}
                className="bg-cyan-400 hover:bg-orange-500 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base"
              >
                Search
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Blue Strip - Positioned below header */}
      <div className="bg-cyan-400 text-white py-2 relative z-30">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <p className="text-xs sm:text-sm md:text-base font-medium">
            🕹️ Trusted by Top Streamers and Gamers – Shop the Same Games They Play!
          </p>
        </div>
      </div>
    </>
  );
};

export default Header;