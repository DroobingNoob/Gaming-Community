import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Crown } from 'lucide-react';

interface CategoriesProps {
  onViewAllGames: () => void;
  onViewSubscriptions: () => void;
}

const Categories: React.FC<CategoriesProps> = ({ onViewAllGames, onViewSubscriptions }) => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: "PlayStation Games",
      icon: <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />,
      description: "Click to Browse PS4 & PS5 exclusive titles",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
      gameCount: "300+",
      onClick: () => navigate('/games')
    },
    {
      id: 2,
      name: "Subscriptions",
      icon: <Crown className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />,
      description: "Click to Browse Subscriptions",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
      gameCount: "10+",
      onClick: () => navigate('/subscriptions')
    }
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-base sm:text-lg px-4">
            Find games for your favorite gaming platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer"
              onClick={category.onClick}
            >
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm hover:from-cyan-50/80 hover:to-orange-50/80 focus:from-cyan-50/80 focus:to-orange-50/80 active:scale-95 active:shadow-inner transition-all duration-300 transform shadow-lg hover:shadow-2xl border border-white/20">

                {/* Background Image */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="relative p-6 sm:p-8 md:p-12 text-center">
                  <div className="text-cyan-500 group-hover:text-orange-500 transition-colors duration-300 mb-4 sm:mb-6 flex justify-center bg-gradient-to-r from-cyan-100 to-blue-100 group-hover:from-orange-100 group-hover:to-red-100 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full items-center mx-auto">
                    {category.icon}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
                    {category.description}
                  </p>
                  
                  <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg">
                    <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      {category.gameCount} Games
                    </span>
                  </div> 
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;