import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
  cartItemCount: number;
  onCartClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  cartItemCount,
  onCartClick
}) => {
  // if (cartItemCount === 0) return null;

  return (
    <button
      id="floating-cart-button"
      onClick={onCartClick}
      className="fixed bottom-20 right-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-40 group animate-pulse"
      title="View Cart"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        <div className="absolute -top-2 -right-2 bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
          {cartItemCount > 99 ? '99+' : cartItemCount}
        </div>
      </div>

      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-800 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap">
          {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart
          <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </button>
  );
};

export default FloatingCartButton;