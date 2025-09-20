import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbjymmzgysjzhmmkafaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianltbXpneXNqemhtbWthZmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMTMyNzMsImV4cCI6MjA2NTc4OTI3M30.xblro8Quvlg1N9qSz1FcCnQ1ptJgzrV2BlJBHGHvhTg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Game {
  id?: string;
  title: string;
  edition?: 'Standard' | 'Premium' | 'Ultimate' | 'Deluxe'; // All four editions
  base_game_id?: string; // Links different editions of the same game
  edition_features?: string[]; // Edition-specific features
  image: string;
  original_price: number;
  sale_price: number; // Keep for subscriptions compatibility
  // Rental pricing
  rent_1_month?: number;
  rent_3_months?: number;
  rent_6_months?: number;
  rent_12_months?: number;
  // Permanent pricing
  permanent_offline_price?: number;
  permanent_online_price?: number;
  platform: string[];
  discount: number;
  description: string;
  type: string[];
  category: 'game' | 'subscription';
  show_in_bestsellers?: boolean;
  is_recommended?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id?: string;
  image: string; // Phone screenshot URL
  created_at?: string;
  updated_at?: string;
}

// Helper function to calculate discount percentage for games
export const calculateGameDiscount = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= 0 || currentPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Helper function to get the display price for games based on selected type
export const getGameDisplayPrice = (game: Game, selectedType: string, selectedRentDuration?: string): number => {
  if (game.category === 'subscription') {
    return game.sale_price; // Subscriptions keep original logic
  }

  // For games, calculate based on type
  if (selectedType === 'Rent') {
    const rentPrices = {
      '1_month': game.rent_1_month || 0,
      '3_months': game.rent_3_months || 0,
      '6_months': game.rent_6_months || 0,
      '12_months': game.rent_12_months || 0
    };
    return rentPrices[selectedRentDuration as keyof typeof rentPrices] || game.rent_1_month || 0;
  } else if (selectedType === 'Permanent Offline') {
    return game.permanent_offline_price || game.original_price;
  } else if (selectedType === 'Permanent Offline + Online') {
    return game.permanent_online_price || game.original_price;
  }
  
  // Default to 1 month rent price for games
  return game.rent_1_month || game.original_price;
};

// Helper function to get discount percentage for display
export const getGameDiscountPercentage = (game: Game, selectedType: string, selectedRentDuration?: string): number => {
  if (game.category === 'subscription') {
    return game.discount; // Subscriptions keep original logic
  }

  // For games, calculate discount based on selected type vs original price
  const currentPrice = getGameDisplayPrice(game, selectedType, selectedRentDuration);
  return calculateGameDiscount(game.original_price, currentPrice);
};

// Helper function to get available editions for a game (Standard and Premium only)
export const getGameEditions = (games: Game[], baseGameId: string): Game[] => {
  // First try to find by base_game_id relationship
  let editions = games.filter(game => 
    game.base_game_id === baseGameId || 
    game.id === baseGameId ||
    (game.base_game_id && game.base_game_id === baseGameId)
  );
  
  // If no editions found by base_game_id, try to find by title
  if (editions.length <= 1) {
    const baseGame = games.find(game => game.id === baseGameId);
    if (baseGame) {
      editions = games.filter(game => game.title === baseGame.title);
    }
  }
  
  return editions.sort((a, b) => {
    // Sort by edition: Standard first, then Premium, Ultimate, Deluxe
    const editionOrder = { 'Standard': 1, 'Premium': 2, 'Ultimate': 3, 'Deluxe': 4 };
    const aOrder = editionOrder[a.edition as keyof typeof editionOrder] || 999;
    const bOrder = editionOrder[b.edition as keyof typeof editionOrder] || 999;
    return aOrder - bOrder;
  });
};

// Helper function to get the primary edition of a game (for display in listings)
export const getPrimaryEdition = (games: Game[], gameTitle: string): Game | null => {
  const editions = games.filter(game => game.title === gameTitle);
  
  if (editions.length === 0) return null;
  
  // Always return Standard edition first, or the first available edition
  const standardEdition = editions.find(game => game.edition === 'Standard');
  return standardEdition || editions[0];
};

// Helper function to get unique games (only primary editions for customer view)
export const getUniqueGamesForCustomer = (games: Game[]): Game[] => {
  const gameGroups = groupGamesByTitle(games);
  const uniqueGames: Game[] = [];
  
  Object.keys(gameGroups).forEach(title => {
    const primaryEdition = getPrimaryEdition(games, title);
    if (primaryEdition) {
      uniqueGames.push(primaryEdition);
    }
  });
  
  return uniqueGames.sort((a, b) => {
    const aDate = new Date(a.created_at || 0);
    const bDate = new Date(b.created_at || 0);
    return bDate.getTime() - aDate.getTime(); // Newest first
  });
};

// Helper function to get the cheapest edition of a game
export const getCheapestEdition = (games: Game[], gameTitle: string): Game | null => {
  const editions = games.filter(game => game.title === gameTitle);
  
  if (editions.length === 0) return null;
  
  return editions.reduce((cheapest, current) => {
    const cheapestPrice = getGameDisplayPrice(cheapest, 'Rent', '1_month');
    const currentPrice = getGameDisplayPrice(current, 'Rent', '1_month');
    return currentPrice < cheapestPrice ? current : cheapest;
  });
};

// Helper function to group games by title (ignoring edition)
export const groupGamesByTitle = (games: Game[]): { [title: string]: Game[] } => {
  return games.reduce((groups, game) => {
    if (!groups[game.title]) {
      groups[game.title] = [];
    }
    groups[game.title].push(game);
    return groups;
  }, {} as { [title: string]: Game[] });
};

// Helper function to find all editions of a game by any edition ID
export const findAllEditionsByGameId = (games: Game[], gameId: string): Game[] => {
  const targetGame = games.find(game => game.id === gameId);
  if (!targetGame) return [];
  
  // Find all games with the same title
  const sameTitle = games.filter(game => game.title === targetGame.title);
  
  // If we have base_game_id relationships, use those
  const baseGameId = targetGame.base_game_id || targetGame.id;
  const relatedByBaseId = games.filter(game => 
    game.base_game_id === baseGameId || 
    game.id === baseGameId ||
    (game.base_game_id && game.base_game_id === targetGame.base_game_id)
  );
  
  // Return the larger set (more comprehensive)
  const editions = relatedByBaseId.length > sameTitle.length ? relatedByBaseId : sameTitle;
  
  return editions.sort((a, b) => {
    const editionOrder = { 'Standard': 1, 'Premium': 2, 'Ultimate': 3, 'Deluxe': 4 };
    const aOrder = editionOrder[a.edition as keyof typeof editionOrder] || 999;
    const bOrder = editionOrder[b.edition as keyof typeof editionOrder] || 999;
    return aOrder - bOrder;
  });
};