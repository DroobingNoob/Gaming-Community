import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
  onCartClick: () => void;
  isLoggedIn: boolean;
  cartItemCount: number;
  onNavigation: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onCartClick, isLoggedIn, cartItemCount, onNavigation }) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
  };

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Categories', id: 'categories' },
    { name: 'FAQ', id: 'faq' },
    { name: 'Contact', id: 'contact' }
  ];

  const handleNavClick = (itemId: string) => {
    if (itemId === 'home') {
      onNavigation('home');
    } else {
      onNavigation(itemId);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-md relative">
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

                {/* Logo - Made More Prominent */}
                <div className="flex items-center space-x-4">
                  <img 
                    src="/1000156095.jpg" 
                    alt="Gaming Community" 
                    className="w-17 h-17 object-contain"
                  />
                </div>

                {/* Auth & Cart */}
                <div className="flex items-center space-x-4 flex-1 justify-end">
                  <button
                    onClick={onLoginClick}
                    className="flex items-center space-x-2 px-4 py-2 text-cyan-600 hover:text-orange-500 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>{isLoggedIn ? 'Account' : 'Login'}</span>
                  </button>
                  
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
                        className="text-cyan-600 hover:text-orange-500 font-medium transition-colors py-2"
                      >
                        {item.name}
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
                  className="text-cyan-600 p-1"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Mobile Logo - Made More Prominent */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <img 
                    src="/1000156095.jpg" 
                    alt="Gaming Community" 
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  />
                  <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                    Gaming Community
                  </span>
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
                <div className="mt-4 pb-4 border-t border-gray-200">
                  <nav className="mt-4 space-y-2">
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className="block w-full text-left py-3 px-2 text-cyan-600 hover:text-orange-500 transition-colors hover:bg-gray-50 rounded-lg"
                      >
                        {item.name}
                      </button>
                    ))}
                  </nav>
                  <button
                    onClick={onLoginClick}
                    className="mt-4 w-full text-left py-3 px-2 text-cyan-600 hover:text-orange-500 transition-colors hover:bg-gray-50 rounded-lg"
                  >
                    {isLoggedIn ? 'Account' : 'Login with Google'}
                  </button>
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
                  className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border-2 border-cyan-400 rounded-full focus:outline-none focus:border-orange-400 transition-colors text-sm sm:text-lg"
                  autoFocus
                />
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <button className="bg-cyan-400 hover:bg-orange-500 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base">
                Search
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Blue Strip */}
      <div className="bg-cyan-400 text-white py-2">
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