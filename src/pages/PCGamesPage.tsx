import React, { useState, useMemo } from "react";
import { Search, Filter, Grid, List, Gamepad2 } from "lucide-react";
import { useGames } from "../hooks/useSupabaseData";
import {
  Game,
  getPlatformsForGame,
  getStartingPrice,
} from "../config/supabase";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const platformOptions = ["all", "PS5", "PS4","PSVR2", "Xbox", "PC"];
const sortOptions = [
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const GamesPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("PC");
  const [sortBy, setSortBy] = useState("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(
    () => ({
      searchQuery,
      platform: selectedPlatform,
      sortBy,
      page: currentPage,
      limit: 24,
    }),
    [searchQuery, selectedPlatform, sortBy, currentPage]
  );

  const { games, totalCount, totalPages, loading, error } = useGames(filters);

  const handleProductClick = (game: Game) => {
    navigate(`/games/${game.id}`);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedPlatform("all");
    setSortBy("name-asc");
    setCurrentPage(1);
  };

  const renderPlatformBadges = (game: Game) => {
    const platforms = getPlatformsForGame(game);

    if (platforms.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {platforms.slice(0, 3).map((platform) => (
          <span
            key={platform}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium"
          >
            {platform}
          </span>
        ))}
        {platforms.length > 3 && (
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium">
            +{platforms.length - 3}
          </span>
        )}
      </div>
    );
  };

  const renderGameCard = (game: Game) => {
    const startingPrice = getStartingPrice(game);

    return (
      <div
        key={game.id}
        onClick={() => handleProductClick(game)}
        className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      >
        <div className="relative overflow-hidden">
          <img
            src={game.image}
            alt={game.title}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {game.edition && game.edition !== "Standard" && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
              {game.edition}
            </div>
          )}
          {game.show_in_bestsellers && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
              Bestseller
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
            {game.title}
          </h3>

          {renderPlatformBadges(game)}

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Starting from</p>
              <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                ₹{startingPrice}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(game);
              }}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 shadow-md"
            >
              View
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderGameListItem = (game: Game) => {
    const startingPrice = getStartingPrice(game);

    return (
      <div
        key={game.id}
        onClick={() => handleProductClick(game)}
        className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 lg:w-56 flex-shrink-0 relative overflow-hidden">
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {game.edition && game.edition !== "Standard" && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                {game.edition}
              </div>
            )}
          </div>

          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg sm:text-xl mb-2">
                    {game.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base line-clamp-3">
                    {game.description}
                  </p>
                </div>
              </div>

              {renderPlatformBadges(game)}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Starting from</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  ₹{startingPrice}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductClick(game);
                }}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md"
              >
                View Product
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Loader
            size="large"
            message="Loading games..."
            fullScreen={false}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Failed to load games
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Games Collection
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Explore our gaming library
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for games..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="lg:hidden bg-white border border-gray-200 px-4 py-3 rounded-2xl flex items-center gap-2 text-gray-700"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="flex bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-3 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                      : "text-gray-600"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-3 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                      : "text-gray-600"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block mt-6 pt-6 border-t border-gray-200`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => {
                    setSelectedPlatform(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {platformOptions.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform === "all" ? "All Platforms" : platform}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600 lg:text-center">
                <span className="font-semibold text-gray-800">{totalCount}</span>{" "}
                game{totalCount !== 1 ? "s" : ""} found
              </div>

              <div className="lg:text-right">
                <button
                  onClick={resetFilters}
                  className="w-full lg:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-2xl font-medium transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {games.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 text-center shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No games found
            </h2>
            <p className="text-gray-600 mb-6">
              Try changing your search or filter options.
            </p>
            <button
              onClick={resetFilters}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {games.map((game) => renderGameCard(game))}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {games.map((game) => renderGameListItem(game))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, currentPage - 3),
                    Math.min(totalPages, currentPage + 2)
                  )
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-xl border ${
                        page === currentPage
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-transparent"
                          : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GamesPage;