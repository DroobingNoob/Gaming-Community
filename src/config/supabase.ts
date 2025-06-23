import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbjymmzgysjzhmmkafaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianltbXpneXNqemhtbWthZmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMTMyNzMsImV4cCI6MjA2NTc4OTI3M30.xblro8Quvlg1N9qSz1FcCnQ1ptJgzrV2BlJBHGHvhTg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Game {
  id?: string;
  title: string;
  image: string;
  original_price: number;
  sale_price: number; // Keep for subscriptions compatibility
  // Rental pricing
  rent_1_month?: number;
  rent_2_months?: number;
  rent_3_months?: number;
  rent_6_months?: number;
  // Permanent pricing
  permanent_offline_price?: number;
  permanent_online_price?: number;
  platform: string[];
  discount: number;
  description: string;
  type: string[];
  category: 'game' | 'subscription';
  show_in_bestsellers?: boolean;
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
      '2_months': game.rent_2_months || 0,
      '3_months': game.rent_3_months || 0,
      '6_months': game.rent_6_months || 0
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