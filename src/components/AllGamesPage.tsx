import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, ChevronDown, Grid, List } from 'lucide-react';

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

interface AllGamesPageProps {
  onGameClick: (game: Game) => void;
  onBackToHome: () => void;
}

const AllGamesPage: React.FC<AllGamesPageProps> = ({ onGameClick, onBackToHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 24;

  // Extended games list for demonstration
  const allGames: Game[] = [
    {
      id: 1,
      title: "Grand Theft Auto V Premium Edition",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 59.99,
      salePrice: 19.99,
      rating: 4.8,
      platform: "PS5",
      discount: 67,
      description: "Experience the award-winning Grand Theft Auto V with enhanced graphics and performance on PlayStation 5.",
      features: ["Enhanced graphics", "Complete story", "Online multiplayer"],
      systemRequirements: ["PlayStation 5 console required", "50 GB storage"]
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
      description: "Embark on an epic journey as the legendary Monkey King in this action RPG.",
      features: ["Epic adventure", "Stunning graphics", "Boss battles"],
      systemRequirements: ["PlayStation 5 console required", "45 GB storage"]
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
      description: "Step into feudal Japan as a legendary shinobi and samurai.",
      features: ["Dual protagonists", "Japan setting", "Stealth mechanics"],
      systemRequirements: ["PlayStation 5 console required", "55 GB storage"]
    },
    {
      id: 4,
      title: "Spider-Man 2",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 69.99,
      salePrice: 39.99,
      rating: 4.8,
      platform: "PS5",
      discount: 43,
      description: "Swing through New York City as both Peter Parker and Miles Morales.",
      features: ["Dual Spider-Men", "Web-swinging", "Open world"],
      systemRequirements: ["PlayStation 5 console required", "48 GB storage"]
    },
    {
      id: 5,
      title: "Call of Duty: Modern Warfare III",
      image: "https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 69.99,
      salePrice: 44.99,
      rating: 4.6,
      platform: "PS5",
      discount: 36,
      description: "Experience the most advanced Call of Duty ever with Modern Warfare III.",
      features: ["Campaign", "Multiplayer", "Zombies mode"],
      systemRequirements: ["PlayStation 5 console required", "65 GB storage"]
    },
    {
      id: 6,
      title: "FIFA 24",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 59.99,
      salePrice: 29.99,
      rating: 4.5,
      platform: "PS4",
      discount: 50,
      description: "The world's game returns with FIFA 24, featuring enhanced gameplay and realism.",
      features: ["Ultimate Team", "Career Mode", "Online seasons"],
      systemRequirements: ["PlayStation 4 console required", "40 GB storage"]
    },
    {
      id: 7,
      title: "Horizon Forbidden West",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 69.99,
      salePrice: 34.99,
      rating: 4.8,
      platform: "PS4",
      discount: 50,
      description: "Join Aloy as she braves the Forbidden West - a majestic but dangerous frontier.",
      features: ["Open world", "Robot hunting", "Beautiful graphics"],
      systemRequirements: ["PlayStation 4 console required", "90 GB storage"]
    },
    {
      id: 8,
      title: "God of War Ragnarök",
      image: "https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 69.99,
      salePrice: 39.99,
      rating: 4.9,
      platform: "PS4",
      discount: 43,
      description: "Embark on an epic and heartfelt journey as Kratos and Atreus struggle with holding on and letting go.",
      features: ["Norse mythology", "Father-son journey", "Epic battles"],
      systemRequirements: ["PlayStation 4 console required", "70 GB storage"]
    },
    // Add more games to demonstrate pagination
    ...Array.from({ length: 40 }, (_, i) => ({
      id: 9 + i,
      title: `Game Title ${9 + i}`,
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 59.99,
      salePrice: 29.99 + (i % 3) * 10,
      rating: 4.0 + (i % 10) * 0.1,
      platform: i % 2 === 0 ? "PS5" : "PS4",
      discount: 30 + (i % 5) * 10,
      description: `This is an amazing game with incredible features and gameplay mechanics that will keep you entertained for hours.`,
      features: ["Feature 1", "Feature 2", "Feature 3"],
      systemRequirements: [`PlayStation ${i % 2 === 0 ? '5' : '4'} console required`, "50 GB storage"]
    }))
  ];

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let filtered = allGames.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = selectedPlatform === 'all' || game.platform === selectedPlatform;
      const matchesPrice = game.salePrice >= priceRange[0] && game.salePrice <= priceRange[1];
      
      return matchesSearch && matchesPlatform && matchesPrice;
    });

    // Sort games
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'price-low':
          return a.salePrice - b.salePrice;
        case 'price-high':
          return b.salePrice - a.salePrice;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allGames, searchQuery, selectedPlatform, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedGames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGames = filteredAndSortedGames.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-2 text-cyan-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">All Games</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-600 hover:text-cyan-600 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 bg-cyan-400 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-6`}>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Games</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Platform Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  <option value="all">All Platforms</option>
                  <option value="PS5">PlayStation 5</option>
                  <option value="PS4">PlayStation 4</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="300"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="300"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="rating">Rating (Highest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedGames.length)} of {filteredAndSortedGames.length} games
              </p>
            </div>

            {/* Games Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                    onClick={() => onGameClick(game)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {game.discount > 0 && (
                        <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          -{game.discount}%
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-cyan-400 text-white px-2 py-1 rounded text-xs font-medium">
                        {game.platform}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
                        {game.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg font-bold text-orange-500">
                          ${game.salePrice}
                        </span>
                        {game.originalPrice > game.salePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${game.originalPrice}
                          </span>
                        )}
                      </div>
                      <button className="w-full bg-cyan-400 hover:bg-orange-500 text-white py-2 px-3 rounded-lg font-medium text-sm transition-colors">
                        Select Options
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {paginatedGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onGameClick(game)}
                  >
                    <div className="flex items-center p-6">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-24 h-24 object-cover rounded-lg mr-6"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg mb-2">{game.title}</h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{game.description}</p>
                            <div className="flex items-center space-x-2">
                              <span className="bg-cyan-400 text-white px-2 py-1 rounded text-xs font-medium">
                                {game.platform}
                              </span>
                              <span className="text-sm text-gray-500">Rating: {game.rating}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-2xl font-bold text-orange-500">
                                ${game.salePrice}
                              </span>
                              {game.originalPrice > game.salePrice && (
                                <span className="text-lg text-gray-500 line-through">
                                  ${game.originalPrice}
                                </span>
                              )}
                            </div>
                            <button className="bg-cyan-400 hover:bg-orange-500 text-white py-2 px-6 rounded-lg font-medium transition-colors">
                              Select Options
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-cyan-400 text-white'
                          : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? 'bg-cyan-400 text-white'
                          : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllGamesPage;