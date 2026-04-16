import React from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Crown, Monitor } from "lucide-react";

const Categories: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: "PS Games",
      icon: <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />,
      description: "Click to Browse PS4, PS5 Games",
      image: "/ps_(2).jpg",
      gameCount: "500+",
      onClick: () => navigate("/games"),
    },
    {
      id: 2,
      name: "PC Games",
      icon: <Monitor className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />,
      description: "Click to Browse PC Games",
      image: "/windows_(2).jpg",
      gameCount: "200+",
      onClick: () => navigate("/pc-games"),
    },
    {
      id: 3,
      name: "Subscriptions",
      icon: <Crown className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />,
      description: "Click to Browse Subscriptions",
      image: "/ott_(2).jpg",
      gameCount: "10+",
      onClick: () => navigate("/subscriptions"),
    },
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={category.onClick}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-md hover:shadow-cyan-400/40 border-2 border-transparent hover:border-cyan-400 cursor-pointer transform hover:-translate-y-2 active:scale-95 transition-all duration-300 ease-out text-left"
              type="button"
              aria-label={category.name}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-60 sm:h-72 md:h-80 object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute inset-x-0 top-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white/15 backdrop-blur-md text-white rounded-full p-3 border border-white/20">
                  {category.icon}
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] text-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-black/50 px-4 py-3 rounded-2xl backdrop-blur-sm">
                  <div className="text-white text-lg sm:text-xl font-semibold tracking-wide">
                    {category.name}
                  </div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1">
                    {category.description}
                  </div>
                  <div className="text-cyan-200 text-xs sm:text-sm font-medium mt-1">
                    {category.gameCount}{" "}
                    {category.name !== "Subscriptions" ? "Games" : "Subscriptions"}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;