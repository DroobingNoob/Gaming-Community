import React from 'react';

interface Game {
  id: number;
  title: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  platform: string;
  discount: number;
  description: string;
  features: string[];
  systemRequirements: string[];
}

interface BestSellersProps {
  onGameClick: (game: Game) => void;
}

const BestSellers: React.FC<BestSellersProps> = ({ onGameClick }) => {
  const games: Game[] = [
    {
      id: 1,
      title: "Grand Theft Auto V Premium Edition",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 59.99,
      salePrice: 19.99,
      platform: "PS5",
      discount: 67,
      description: "Experience the award-winning Grand Theft Auto V with enhanced graphics and performance on PlayStation 5. The Premium Edition includes the complete GTA V story, GTA Online, and the Criminal Enterprise Starter Pack.",
      features: [
        "Enhanced graphics and performance for PS5",
        "Complete GTA V single-player story",
        "GTA Online multiplayer experience",
        "Criminal Enterprise Starter Pack included",
        "Exclusive vehicles and properties",
        "Regular content updates"
      ],
      systemRequirements: [
        "PlayStation 5 console required",
        "50 GB available storage space",
        "Internet connection for online features",
        "PlayStation Plus for online multiplayer"
      ]
    },
    {
      id: 2,
      title: "Black Myth: Wukong",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 69.99,
      salePrice: 49.99,
      platform: "PS5",
      discount: 29,
      description: "Embark on an epic journey as the legendary Monkey King in this action RPG inspired by the classic Chinese novel Journey to the West. Experience stunning visuals and challenging combat.",
      features: [
        "Epic single-player adventure",
        "Stunning next-gen graphics",
        "Challenging boss battles",
        "Rich Chinese mythology",
        "Fluid combat system",
        "Beautiful environments"
      ],
      systemRequirements: [
        "PlayStation 5 console required",
        "45 GB available storage space",
        "4K HDR display recommended",
        "DualSense controller features"
      ]
    },
    {
      id: 3,
      title: "Assassin's Creed Shadows",
      image: "https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 79.99,
      salePrice: 59.99,
      platform: "PS5",
      discount: 25,
      description: "Step into feudal Japan as a legendary shinobi and samurai in the latest Assassin's Creed adventure. Experience dual protagonists with unique gameplay styles.",
      features: [
        "Dual protagonist gameplay",
        "Feudal Japan setting",
        "Stealth and combat mechanics",
        "Beautiful open world",
        "Historical accuracy",
        "Multiple story paths"
      ],
      systemRequirements: [
        "PlayStation 5 console required",
        "55 GB available storage space",
        "Internet connection for updates",
        "Ubisoft Connect account"
      ]
    },
    {
      id: 4,
      title: "Xbox Game Pass Ultimate (Lifetime)",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 299.99,
      salePrice: 199.99,
      platform: "Xbox",
      discount: 33,
      description: "Get unlimited access to hundreds of high-quality games with Xbox Game Pass Ultimate. Includes Xbox Live Gold, PC Game Pass, and cloud gaming.",
      features: [
        "Access to 100+ games",
        "Day-one releases included",
        "Xbox Live Gold membership",
        "PC Game Pass included",
        "Cloud gaming support",
        "EA Play membership"
      ],
      systemRequirements: [
        "Xbox console or Windows PC",
        "Internet connection required",
        "Microsoft account",
        "Compatible device for cloud gaming"
      ]
    },
    {
      id: 5,
      title: "Spider-Man 2",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 69.99,
      salePrice: 39.99,
      platform: "PS5",
      discount: 43,
      description: "Swing through New York City as both Peter Parker and Miles Morales in this spectacular superhero adventure. Face new threats and master new abilities.",
      features: [
        "Play as both Spider-Men",
        "Enhanced web-swinging",
        "New York City open world",
        "Symbiote powers",
        "Co-op gameplay elements",
        "Stunning ray-traced reflections"
      ],
      systemRequirements: [
        "PlayStation 5 console required",
        "48 GB available storage space",
        "4K HDR display recommended",
        "DualSense haptic feedback"
      ]
    },
    {
      id: 6,
      title: "Call of Duty: Modern Warfare III",
      image: "https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 69.99,
      salePrice: 44.99,
      platform: "PS5",
      discount: 36,
      description: "Experience the most advanced Call of Duty ever with Modern Warfare III. Features campaign, multiplayer, and the all-new Zombies mode.",
      features: [
        "Epic single-player campaign",
        "Multiplayer with new maps",
        "Zombies mode included",
        "Cross-platform play",
        "Battle royale integration",
        "Regular seasonal updates"
      ],
      systemRequirements: [
        "PlayStation 5 console required",
        "65 GB available storage space",
        "Internet connection for multiplayer",
        "PlayStation Plus for online play"
      ]
    }
  ];

  const handleViewAllGames = () => {
    // This will be handled by the parent component
    window.dispatchEvent(new CustomEvent('viewAllGames'));
  };

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
          {games.map((game) => (
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
                {game.discount > 0 && (
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                    -{game.discount}%
                  </div>
                )}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  {game.platform}
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
                    ${game.salePrice}
                  </span>
                  {game.originalPrice > game.salePrice && (
                    <span className="text-sm sm:text-base md:text-lg text-gray-500 line-through">
                      ${game.originalPrice}
                    </span>
                  )}
                </div>

                {/* Select Options Button */}
                <button className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-orange-500 hover:to-red-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg hover:shadow-xl transform hover:scale-105">
                  <span>Select Options</span>
                </button>
              </div>
            </div>
          ))}
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