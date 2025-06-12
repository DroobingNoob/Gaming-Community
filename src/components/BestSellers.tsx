import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';

interface Game {
  id: number;
  title: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  rating: number;
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
      rating: 4.8,
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
      rating: 4.9,
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
      rating: 4.7,
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
      rating: 4.9,
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
      rating: 4.8,
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
      rating: 4.6,
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Best Selling Games
          </h2>
          <p className="text-gray-600 text-lg">
            Most popular titles loved by our gaming community
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
              onClick={() => onGameClick(game)}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {game.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{game.discount}%
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-cyan-400 text-white px-2 py-1 rounded text-xs font-medium">
                  {game.platform}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                  {game.title}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(game.rating)
                            ? 'fill-orange-400 text-orange-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({game.rating})</span>
                </div>

                {/* Pricing */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl font-bold text-orange-500">
                    ${game.salePrice}
                  </span>
                  {game.originalPrice > game.salePrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ${game.originalPrice}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button className="w-full bg-cyan-400 hover:bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 group">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-transparent border-2 border-cyan-400 text-cyan-600 hover:bg-cyan-400 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300">
            View All Games
          </button>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;