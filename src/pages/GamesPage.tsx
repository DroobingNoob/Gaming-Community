import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGames } from '../hooks/useSupabaseData';
import { Game, getGameDisplayPrice, getGameDiscountPercentage } from '../config/supabase';
import Loader from '../components/Loader';
import { useNavigationType } from "react-router-dom";

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
   const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 12;

   const navigationType = useNavigationType();

  // Use server-side filtering and pagination
  const { games, totalCount, totalPages, loading, error } = useGames({
    searchQuery,
    platform: selectedPlatform,
    priceRange,
    sortBy,
    page: currentPage,
    limit: itemsPerPage
  });

  useEffect(() => {
  // setCurrentPage(1); 
}, [searchQuery, selectedPlatform, priceRange, sortBy]); 

    useEffect(() => {
  if (navigationType === "POP") {
    // User came back (browser back/forward)
    const savedPage = sessionStorage.getItem("gamesPage");
    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10));
    } else {
      setCurrentPage(1);
    }
  } else {
    // Fresh visit (homepage → games, or direct URL)
    sessionStorage.removeItem("gamesPage");
    setCurrentPage(1);
  }
}, [navigationType]);
 

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    sessionStorage.setItem("gamesPage", page.toString()); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
 

  const handleGameClick = (game: Game) => {
    sessionStorage.setItem("gamesPage", currentPage.toString()); 
    navigate(`/games/${game.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">All Games</h1>
            </div>
          </div>
          <Loader size="large" message="Loading amazing games..." fullScreen={false} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">All Games</h1>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load games. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">All Games</h1>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Games</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={tempSearchQuery}
                    onChange={(e) => setTempSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                  />
                  
                </div>
                 <button
      onClick={() => setSearchQuery(tempSearchQuery)}
      className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-orange-500 hover:to-red-500 text-white px-4 rounded-r-lg shadow-lg transition-all"
                   style={{marginTop: "1rem"}}
    >
      Search
    </button>
              </div>

              {/* Platform Filter */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                >
                  <option value="all">All Platforms</option>
                  <option value="PS5">PlayStation 5</option>
                  <option value="PS4">PlayStation 4</option>
                  <option value="PSVR2">PlayStation VR 2</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
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

          {/* Games Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <p className="text-gray-600 text-sm sm:text-base">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} games
              </p>
            </div>

            {/* Games Grid/List */}
            {games.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No games found matching your criteria.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {games.map((game) => {
                  const displayPrice = getGameDisplayPrice(game, 'Rent', '1_month');
                  const discountPercentage = getGameDiscountPercentage(game, 'Rent', '1_month');

                  return (
                    <div
                      key={game.id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-3 cursor-pointer group"
                      onClick={() => handleGameClick(game)}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={game.image}
                          alt={game.title}
                          className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {discountPercentage > 0 && (
                          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg">
                            -{discountPercentage}%
                          </div>
                        )}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium shadow-lg">
                          {game.category === 'game' ? game.platform.join(', ') : 'Subscription'}
                        </div>
                        {game.edition && game.edition !== 'Standard' && (
                          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium shadow-lg">
                            {game.edition}
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-2 line-clamp-2">
                          {game.title}
                        </h3>
                        <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3">
                          <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            ₹{displayPrice}
                          </span>
                          {discountPercentage > 0 && (
                            <span className="text-xs sm:text-sm text-gray-500 line-through">
                              ₹{game.original_price}
                            </span>
                          )}
                        </div>
                        <button className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-orange-500 hover:to-red-500 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                          Select Options
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {games.map((game) => {
                  const displayPrice = getGameDisplayPrice(game, 'Rent', '1_month');
                  const discountPercentage = getGameDiscountPercentage(game, 'Rent', '1_month');

                  return (
                    <div
                      key={game.id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => handleGameClick(game)}
                    >
                      <div className="flex items-center p-4 sm:p-6">
                        <img
                          src={game.image}
                          alt={game.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg mr-4 sm:mr-6"
                        />
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 mb-3 sm:mb-0">
                              <h3 className="font-bold text-gray-800 text-sm sm:text-lg mb-1 sm:mb-2">{game.title}</h3>
                              <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2 hidden sm:block">{game.description}</p>
                              <div className="flex items-center space-x-2">
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                                  {game.category === 'game' ? game.platform.join(', ') : 'Subscription'}
                                </span>
                                {game.edition && game.edition !== 'Standard' && (
                                  <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded text-xs font-medium">
                                    {game.edition}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                                <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                  ₹{displayPrice}
                                </span>
                                {discountPercentage > 0 && (
                                  <span className="text-sm sm:text-lg text-gray-500 line-through">
                                    ₹{game.original_price}
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
                  );
                })}
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

export default GamesPage;