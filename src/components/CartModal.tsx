import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, Tag, Lock } from "lucide-react";
import { useGames, useSubscriptions } from "../hooks/useSupabaseData";
import {
  Game,
  getPlatformsForGame,
  getStartingPrice,
} from "../config/supabase";
import { useNavigate } from "react-router-dom";
import { couponService, Coupon } from "../services/couponService";

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
  onCheckout,
}) => {
  const navigate = useNavigate();
  const { games = [] } = useGames({ limit: 250 });
  const { subscriptions = [] } = useSubscriptions({ limit: 50 });

  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    const loadCoupons = async () => {
      if (!isOpen) return;
      setLoadingCoupons(true);
      const data = await couponService.getActiveCoupons();
      setAvailableCoupons(data || []);
      setLoadingCoupons(false);
    };

    loadCoupons();
  }, [isOpen]);



  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const rentGamesCount = cartItems.filter((item) =>
    item.type.toLowerCase().includes("rent")
  ).length;

  const recommendedProducts = [
    ...games.filter((game) => game.is_recommended === true),
    ...subscriptions.filter((sub) => sub.is_recommended === true),
  ].slice(0, 6);

  const handleGameClick = (game: Game) => {
    onClose();
    if (game.category === "game") {
      navigate(`/games/${game.id}`);
    } else {
      navigate(`/subscriptions/${game.id}`);
    }
  };

  const renderProductMeta = (game: Game) => {
    const platforms = getPlatformsForGame(game);

    return (
      <div className="text-xs text-gray-500">
        {game.category === "subscription"
          ? "Subscription"
          : platforms.join(", ") || "Game"}
      </div>
    );
  };

  const couponSuggestions = useMemo(() => {
    return availableCoupons.map((coupon) => {
      const minAmount = Number(coupon.min_order_amount || 0);
      const minGames = Number(coupon.min_game_count || 0);

      const meetsAmount = total >= minAmount;
      const meetsGames = cartItems.length >= minGames;
      const unlocked = meetsAmount && meetsGames;

      let discountText = "";
      if (coupon.coupon_type === "fixed_amount") {
        discountText = `Save ₹${coupon.value}`;
      } else if (coupon.coupon_type === "percentage") {
        discountText = `Save ${coupon.value}%`;
      } else {
        discountText = coupon.message || "Special benefit coupon";
      }

      let lockReason = "";
      if (!unlocked) {
        const reasons: string[] = [];
        if (!meetsAmount) {
          reasons.push(`₹${Math.max(0, minAmount - total)} more`);
        }
        if (!meetsGames) {
          reasons.push(`${Math.max(0, minGames - cartItems.length)} more game(s)`);
        }
        lockReason = `Need ${reasons.join(" and ")}`;
      }

      return {
        ...coupon,
        unlocked,
        discountText,
        lockReason,
      };
    });
  }, [availableCoupons, total, cartItems.length]);

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl sm:w-full max-h-[90vh] sm:max-h-[80vh] shadow-2xl border border-white/20 overflow-hidden flex flex-col">
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

        <div className="overflow-y-auto">
          <div className="p-3 sm:p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-base sm:text-lg mb-4">
                  Your cart is empty
                </p>
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
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 sm:space-x-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 aspect-square object-cover rounded-lg shadow-md flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 flex-wrap">
                        <span className="bg-cyan-400 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium">
                          {item.platform}
                        </span>
                        <span className="bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium">
                          {item.type}
                        </span>
                        {item.edition && item.edition !== "Standard" && (
                          <span className="bg-purple-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium">
                            {item.edition}
                          </span>
                        )}
                      </div>
                      <p className="text-cyan-600 font-bold text-sm sm:text-lg">
                        ₹{item.price}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="text-gray-500 hover:text-cyan-600 transition-colors p-1.5 sm:p-2 rounded-l-lg hover:bg-gray-50 touch-manipulation"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="font-medium px-2 sm:px-3 py-1.5 sm:py-2 min-w-[2rem] sm:min-w-[3rem] text-center border-x border-gray-200 text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="text-gray-500 hover:text-cyan-600 transition-colors p-1.5 sm:p-2 rounded-r-lg hover:bg-gray-50 touch-manipulation"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>

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

          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="mb-4 space-y-2">
                {loadingCoupons ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-500 shadow-sm">
                    Loading available coupons...
                  </div>
                ) : couponSuggestions.length > 0 ? (
                  <>
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Available coupon suggestions
                    </div>
                    {couponSuggestions.map((coupon) => (
                      <div
                        key={coupon.id}
                        className={`rounded-xl p-3 shadow-sm border text-sm ${
                          coupon.unlocked
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-900"
                            : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 text-gray-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 font-bold">
                                <Tag className="w-4 h-4" />
                                {coupon.code}
                              </span>
                              {!coupon.unlocked && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 font-medium">
                                  <Lock className="w-3 h-3" />
                                  Locked
                                </span>
                              )}
                            </div>
                            <div className="font-medium mt-1">{coupon.name}</div>
                            <div className="text-xs mt-1">
                              {coupon.discountText}
                            </div>
                            {coupon.message &&
                              coupon.coupon_type !== "message_only" && (
                                <div className="text-xs mt-1 opacity-90">
                                  {coupon.message}
                                </div>
                              )}
                            {!coupon.unlocked && coupon.lockReason && (
                              <div className="text-xs mt-1 text-red-500">
                                {coupon.lockReason}
                              </div>
                            )}
                          </div>

                          <div
                            className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                              coupon.unlocked
                                ? "bg-green-200 text-green-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {coupon.unlocked ? "Available" : "Locked"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : null}
              </div>

              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl font-bold text-gray-800">
                  Total:
                </span>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  ₹{total.toFixed(2)}
                </span>
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

          {recommendedProducts.length > 0 && (
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-gradient-to-r from-white to-gray-50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">
                You Might Also Like
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {recommendedProducts.map((game) => {
                  const displayPrice = getStartingPrice(game);

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

                        {game.edition && game.edition !== "Standard" && (
                          <div className="absolute bottom-1 left-1 bg-purple-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                            {game.edition}
                          </div>
                        )}
                      </div>

                      <div className="p-2 sm:p-3">
                        <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 line-clamp-2">
                          {game.title}
                        </h4>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-orange-500 font-bold text-sm">
                              ₹{displayPrice}
                            </span>
                          </div>

                          {renderProductMeta(game)}
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