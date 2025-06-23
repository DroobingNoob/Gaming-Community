import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBestsellers } from '../hooks/useSupabaseData';
import { Game, getGameDisplayPrice, getGameDiscountPercentage } from '../config/supabase';
import Loader from './Loader';

interface BestSellersProps {
  onGameClick: (game: Game) => void;
}

const BestSellers: React.FC<BestSellersProps> = ({ onGameClick }) => {
  const navigate = useNavigate();
  const { bestsellers, loading, error } = useBestsellers(6);

  const handleViewAllGames = () => {
    navigate('/games');
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Best Selling Games
            </h2>
            <p className="text-gray-600 text-base sm:text-lg px-4">
              Most popular titles loved by our gaming community
            </p>
          </div>
          <Loader size="large" message="Loading bestsellers..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Best Selling Games
            </h2>
            <p className="text-red-600">Failed to load games. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (bestsellers.length === 0) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Best Selling Games
            </h2>
            <p className="text-gray-600">No games available. Please check back later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Best Selling Games
          </h2>
          <p className="text-gray-600 text-base sm:text-lg px-4">
            Most popular titles loved by our gaming community
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {bestsellers.map((game) => {
            // For games, show 1 month rent price by default, for subscriptions show sale_price
            const displayPrice = game.category === 'game' 
              ? getGameDisplayPrice(game, 'Rent', '1_month')
              : game.sale_price;
            
            const discountPercentage = game.category === 'game'
              ? getGameDiscountPercentage(game, 'Rent', '1_month')
              : game.discount;

            return (
              <div
                key={game.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-3 group cursor-pointer"
                onClick={() => onGameClick(game)}
              >
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {discountPercentage > 0 && (
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      -{discountPercentage}%
                    </div>
                  )}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                    {game.platform.join(', ')}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 md:p-6">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg mb-2 sm:mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                    {game.title}
                  </h3>

                  {/* Pricing */}
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                    <span className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      ₹{displayPrice}
                    </span>
                    {game.category === 'game' && discountPercentage > 0 && (
                      <span className="text-sm sm:text-base md:text-lg text-gray-500 line-through">
                        ₹{game.original_price}
                      </span>
                    )}
                    {game.category === 'subscription' && game.original_price > game.sale_price && (
                      <span className="text-sm sm:text-base md:text-lg text-gray-500 line-through">
                        ₹{game.original_price}
                      </span>
                    )}
                  </div>

                  {/* Select Options Button */}
                  <button className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-orange-500 hover:to-red-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg hover:shadow-xl transform hover:scale-105">
                    <span>Select Options</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <button 
            onClick={handleViewAllGames}
            className="bg-gradient-to-r from-white to-gray-50 border-2 border-cyan-400 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-blue-500 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Games
          </button>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;