import { useState, useEffect } from 'react';
import { gamesService, subscriptionsService, testimonialsService, GameFilters, PaginatedResponse } from '../services/supabaseService';
import { Game, Testimonial, getUniqueGamesForCustomer } from '../config/supabase';

// Hook for games data with server-side filtering and pagination
export const useGames = (filters: GameFilters = {}) => {
  const [gamesResponse, setGamesResponse] = useState<PaginatedResponse<Game>>({
    data: [],
    count: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [allGames, setAllGames] = useState<Game[]>([]); // All games including all editions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gamesService.getAll(filters);
      setGamesResponse(response);
      
      // For customer view, show only unique games (primary editions)
      const uniqueGames = getUniqueGamesForCustomer(response.data);
      setGamesResponse(prev => ({
        ...response,
        data: uniqueGames
      }));
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch games');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [JSON.stringify(filters)]); // Re-fetch when filters change

  return { 
    games: gamesResponse.data, 
    totalCount: gamesResponse.count,
    totalPages: gamesResponse.totalPages,
    currentPage: gamesResponse.currentPage,
    allGames, 
    loading, 
    error, 
    refetch: fetchGames 
  };
};

// Hook for bestseller games (optimized to fetch exact limit)
export const useBestsellers = (limit: number = 6) => {
  const [bestsellers, setBestsellers] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBestsellers = async () => {
    try {
      setLoading(true);
      const bestsellersData = await gamesService.getBestsellers(limit); // Get exact limit
      
      // Filter to show only unique games (primary editions)
      const uniqueBestsellers = getUniqueGamesForCustomer(bestsellersData);
      setBestsellers(uniqueBestsellers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bestsellers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestsellers();
  }, [limit]);

  return { bestsellers, loading, error, refetch: fetchBestsellers };
};

// Hook for all games data (for admin use - includes all editions) - Keep original for admin
export const useAllGames = () => {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllGames = async () => {
    try {
      setLoading(true);
      // For admin, we still need all data but with optimized columns
      const response = await gamesService.getAll({ limit: 1000 }); // Large limit for admin
      setAllGames(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch all games');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllGames();
  }, []);

  return { allGames, loading, error, refetch: fetchAllGames };
};

// Hook for subscriptions data with server-side filtering and pagination
export const useSubscriptions = (filters: GameFilters = {}) => {
  const [subscriptionsResponse, setSubscriptionsResponse] = useState<PaginatedResponse<Game>>({
    data: [],
    count: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsService.getAll(filters);
      setSubscriptionsResponse(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subscriptions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [JSON.stringify(filters)]); // Re-fetch when filters change

  return { 
    subscriptions: subscriptionsResponse.data,
    totalCount: subscriptionsResponse.count,
    totalPages: subscriptionsResponse.totalPages,
    currentPage: subscriptionsResponse.currentPage,
    loading, 
    error, 
    refetch: fetchSubscriptions 
  };
};

// Hook for testimonials data
export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const testimonialsData = await testimonialsService.getAll();
      setTestimonials(testimonialsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch testimonials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return { testimonials, loading, error, refetch: fetchTestimonials };
};

//Hook for Payment Settings
export const paymentSettingsService = {
  async getSettings() {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .single(); // assuming only one row

    if (error) throw error;
    return data;
  },

  async toggleRazorpayEnabled(currentValue: boolean) {
    const { data, error } = await supabase
      .from('payment_settings')
      .update({ razorpay_enabled: !currentValue })
      .eq('id', 1) // adjust if your row uses a different ID or key
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};