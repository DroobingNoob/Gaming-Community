import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, Grid, List } from 'lucide-react';

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

interface SubscriptionsPageProps {
  onGameClick: (game: Game) => void;
  onBackToHome: () => void;
}

const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({ onGameClick, onBackToHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 24;

  // Subscription services data
  const allSubscriptions: Game[] = [
    {
      id: 101,
      title: "Xbox Game Pass Ultimate (3 Months)",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 44.99,
      salePrice: 29.99,
      platform: "Xbox",
      discount: 33,
      description: "Get unlimited access to hundreds of high-quality games with Xbox Game Pass Ultimate. Includes Xbox Live Gold, PC Game Pass, and cloud gaming.",
      features: ["Access to 100+ games", "Day-one releases included", "Xbox Live Gold membership", "PC Game Pass included", "Cloud gaming support", "EA Play membership"],
      systemRequirements: ["Xbox console or Windows PC", "Internet connection required", "Microsoft account", "Compatible device for cloud gaming"]
    },
    {
      id: 102,
      title: "PlayStation Plus Premium (12 Months)",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 119.99,
      salePrice: 89.99,
      platform: "PlayStation",
      discount: 25,
      description: "PlayStation Plus Premium gives you access to a massive game catalog, classic games, and exclusive benefits.",
      features: ["700+ games catalog", "Classic PS1, PS2, PSP games", "Game trials", "Cloud streaming", "Online multiplayer", "Monthly free games"],
      systemRequirements: ["PlayStation 4 or PlayStation 5", "Internet connection required", "PlayStation Network account"]
    },
    {
      id: 103,
      title: "EA Play Pro (12 Months)",
      image: "https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 99.99,
      salePrice: 79.99,
      platform: "PC",
      discount: 20,
      description: "EA Play Pro gives you unlimited access to EA's best games, plus early access to new releases.",
      features: ["Unlimited access to EA games", "Early access to new releases", "Exclusive member rewards", "No ads", "Premium support"],
      systemRequirements: ["Windows PC", "Origin or Steam client", "Internet connection required"]
    },
    {
      id: 104,
      title: "Nintendo Switch Online + Expansion Pack (12 Months)",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 49.99,
      salePrice: 39.99,
      platform: "Nintendo Switch",
      discount: 20,
      description: "Nintendo Switch Online + Expansion Pack includes classic games, online play, and exclusive content.",
      features: ["Online multiplayer", "Classic NES & SNES games", "N64 & Genesis games", "Animal Crossing DLC", "Cloud saves", "Smartphone app"],
      systemRequirements: ["Nintendo Switch console", "Internet connection required", "Nintendo Account"]
    },
    {
      id: 105,
      title: "Xbox Game Pass Ultimate (6 Months)",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 89.99,
      salePrice: 59.99,
      platform: "Xbox",
      discount: 33,
      description: "6 months of Xbox Game Pass Ultimate with access to hundreds of games and premium features.",
      features: ["Access to 100+ games", "Day-one releases", "Xbox Live Gold", "PC Game Pass", "Cloud gaming", "EA Play"],
      systemRequirements: ["Xbox console or Windows PC", "Internet connection", "Microsoft account"]
    },
    {
      id: 106,
      title: "PlayStation Plus Essential (12 Months)",
      image: "https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 59.99,
      salePrice: 44.99,
      platform: "PlayStation",
      discount: 25,
      description: "PlayStation Plus Essential provides online multiplayer and monthly free games.",
      features: ["Online multiplayer", "Monthly free games", "Exclusive discounts", "Cloud storage for saves", "Share Play"],
      systemRequirements: ["PlayStation 4 or PlayStation 5", "Internet connection", "PlayStation Network account"]
    },
    {
      id: 107,
      title: "Ubisoft+ (3 Months)",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 44.97,
      salePrice: 29.99,
      platform: "PC",
      discount: 33,
      description: "Ubisoft+ gives you access to Ubisoft's entire catalog of premium games.",
      features: ["130+ premium games", "New releases included", "All DLCs included", "Cross-platform progression", "Premium editions"],
      systemRequirements: ["Windows PC", "Ubisoft Connect", "Internet connection"]
    },
    {
      id: 108,
      title: "Apple Arcade (12 Months)",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 59.88,
      salePrice: 39.99,
      platform: "Apple",
      discount: 33,
      description: "Apple Arcade offers premium games without ads or in-app purchases across all Apple devices.",
      features: ["200+ premium games", "No ads or in-app purchases", "Family sharing", "Offline play", "Cross-device sync"],
      systemRequirements: ["iPhone, iPad, Mac, or Apple TV", "iOS 13+ or macOS 10.15+", "Apple ID"]
    }
  ];

  // Filter and sort subscriptions
  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = allSubscriptions.filter(subscription => {
      const matchesSearch = subscription.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = subscription.salePrice >= priceRange[0] && subscription.salePrice <= priceRange[1];
      
      return matchesSearch && matchesPrice;
    });

    // Sort subscriptions
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [allSubscriptions, searchQuery, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscriptions = filteredAndSortedSubscriptions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Subscriptions</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-600 hover:text-cyan-600 transition-colors bg-white/80 backdrop-blur-sm rounded-full shadow-lg"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4 sm:w-5 sm:h-5" /> : <Grid className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 sm:px-4 py-2 rounded-full hover:from-cyan-500 hover:to-blue-600 transition-colors shadow-lg text-sm sm:text-base"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-4 sm:space-y-6`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Subscriptions</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subscriptions Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <p className="text-gray-600 text-sm sm:text-base">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedSubscriptions.length)} of {filteredAndSortedSubscriptions.length} subscriptions
              </p>
            </div>

            {/* Subscriptions Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {paginatedSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-3 cursor-pointer group"
                    onClick={() => onGameClick(subscription)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={subscription.image}
                        alt={subscription.title}
                        className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {subscription.discount > 0 && (
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg">
                          -{subscription.discount}%
                        </div>
                      )}
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium shadow-lg">
                        {subscription.platform}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-2 line-clamp-2">
                        {subscription.title}
                      </h3>
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3">
                        <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                          ${subscription.salePrice}
                        </span>
                        {subscription.originalPrice > subscription.salePrice && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            ${subscription.originalPrice}
                          </span>
                        )}
                      </div>
                      <button className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-orange-500 hover:to-red-500 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        Select Options
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {paginatedSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => onGameClick(subscription)}
                  >
                    <div className="flex items-center p-4 sm:p-6">
                      <img
                        src={subscription.image}
                        alt={subscription.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg mr-4 sm:mr-6"
                      />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 mb-3 sm:mb-0">
                            <h3 className="font-bold text-gray-800 text-sm sm:text-lg mb-1 sm:mb-2">{subscription.title}</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2 hidden sm:block">{subscription.description}</p>
                            <div className="flex items-center space-x-2">
                              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                                {subscription.platform}
                              </span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                ${subscription.salePrice}
                              </span>
                              {subscription.originalPrice > subscription.salePrice && (
                                <span className="text-sm sm:text-lg text-gray-500 line-through">
                                  ${subscription.originalPrice}
                                </span>
                              )}
                            </div>
                            <button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-orange-500 hover:to-red-500 text-white py-2 px-4 sm:px-6 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
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
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg text-sm sm:text-base"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-lg text-sm sm:text-base ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                          : 'text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-300 hover:bg-white/90'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500 text-sm sm:text-base">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-lg text-sm sm:text-base ${
                        currentPage === totalPages
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                          : 'text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-300 hover:bg-white/90'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg text-sm sm:text-base"
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

export default SubscriptionsPage;