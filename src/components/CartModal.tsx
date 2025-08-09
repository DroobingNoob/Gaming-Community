import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useGames, useSubscriptions } from '../hooks/useSupabaseData';
import { Game, getGameDisplayPrice, getGameDiscountPercentage } from '../config/supabase';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  title: string;
  price: number; 
  quantity: number;
  image: string;
  platform: string;
  type: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const navigate = useNavigate();
  const { games } = useGames({ limit: 50 }); // Get more games to filter recommended ones
  const { subscriptions } = useSubscriptions({ limit: 50 }); // Get more subscriptions to filter recommended ones

  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Filter recommended products only
  const recommendedProducts = [
    ...(games || []).filter(game => game.is_recommended === true),
    ...(subscriptions || []).filter(sub => sub.is_recommended === true)
  ].slice(0, 6);

  const handleGameClick = (game: Game) => {
    onClose();
    if (game.category === 'game') {
      navigate(`/games/${game.id}`);
    } else {
      navigate(`/subscriptions/${game.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl sm:w-full max-h-[90vh] sm:max-h-[80vh] shadow-2xl border border-white/20 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-full">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Shopping Cart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto">
          <div className="p-3 sm:p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-base sm:text-lg mb-4">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors shadow-lg text-sm sm:text-base"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 aspect-square object-cover rounded-lg shadow-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base line-clamp-2">{item.title}</h3>
                      <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                        <span className="bg-cyan-400 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium">{item.platform}</span>
                        <span className="bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium">{item.type}</span>
                      </div>
                      <p className="text-cyan-600 font-bold text-sm sm:text-lg">₹{item.price}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1 sm:space-x-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="text-gray-500 hover:text-cyan-600 transition-colors p-1.5 sm:p-2 rounded-l-lg hover:bg-gray-50 touch-manipulation"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="font-medium px-2 sm:px-3 py-1.5 sm:py-2 min-w-[2rem] sm:min-w-[3rem] text-center border-x border-gray-200 text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-cyan-600 transition-colors p-1.5 sm:p-2 rounded-r-lg hover:bg-gray-50 touch-manipulation"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-red-50 touch-manipulation"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl font-bold text-gray-800">Total:</span>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">₹{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 touch-manipulation"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Proceed to Checkout</span>
              </button>
            </div>
          )}

          {/* Recommendations */}
          {recommendedProducts.length > 0 && cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-gradient-to-r from-white to-gray-50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">
                You Might Also Like
              </h3> 
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {recommendedProducts.map((game) => {
                  const displayPrice = game.category === 'game'
                    ? getGameDisplayPrice(game, 'Rent', '1_month')
                    : game.sale_price;

                  const discountPercentage = game.category === 'game'
                    ? getGameDiscountPercentage(game, 'Rent', '1_month')
                    : game.discount;

                  return (
                    <div
                      key={game.id}
                      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                      onClick={() => handleGameClick(game)}
                    >
                      <div className="relative">
                        <img
                          src={game.image}
                          alt={game.title}
                          className="w-full aspect-square object-cover"
                        />
                        {discountPercentage > 0 && (
                          <div className="absolute top-1 right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                            -{discountPercentage}%
                          </div>
                        )}
                      </div>
                      <div className="p-2 sm:p-3">
                        <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 line-clamp-2">
                          {game.title}
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-orange-500 font-bold text-sm">₹{displayPrice}</span>
                            {discountPercentage > 0 && (
                              <span className="text-gray-500 line-through text-xs">₹{game.original_price}</span>
                            )}
                          </div>
                          {game.category === 'game' && (
                            <div className="text-xs text-gray-500">
                              {game.platform.join(', ')}
                            </div>
                          )}
                        </div>
                      </div> 
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;