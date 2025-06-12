import React from 'react';
import { PlayCircle, Crown } from 'lucide-react';

const Categories: React.FC = () => {
  const categories = [
    {
      id: 1,
      name: "PlayStation Games",
      icon: <PlayCircle className="w-12 h-12" />,
      description: "PS4 & PS5 exclusive titles",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
      gameCount: "300+"
    },
    {
      id: 2,
      name: "Subscriptions",
      icon: <Crown className="w-12 h-12" />,
      description: "Game Pass & PS Plus",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
      gameCount: "10+"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg">
            Find games for your favorite gaming platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm hover:from-cyan-50/80 hover:to-orange-50/80 transition-all duration-300 transform hover:-translate-y-3 shadow-lg hover:shadow-2xl border border-white/20">
                {/* Background Image */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="relative p-12 text-center">
                  <div className="text-cyan-500 group-hover:text-orange-500 transition-colors duration-300 mb-6 flex justify-center bg-gradient-to-r from-cyan-100 to-blue-100 group-hover:from-orange-100 group-hover:to-red-100 w-20 h-20 rounded-full items-center mx-auto">
                    {category.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 text-lg">
                    {category.description}
                  </p>
                  
                  <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                    <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      {category.gameCount} Games
                    </span>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;