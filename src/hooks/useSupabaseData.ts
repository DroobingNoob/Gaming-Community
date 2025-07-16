import { useState, useEffect } from 'react';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { Game, Testimonial, getUniqueGamesForCustomer } from '../config/supabase';

// Hook for games data (returns unique games for customer view)
export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]); // All games including all editions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const gamesData = await gamesService.getAll();
      setAllGames(gamesData); // Store all games for admin/detailed views
      
      // For customer view, show only unique games (primary editions)
      const uniqueGames = getUniqueGamesForCustomer(gamesData);
      setGames(uniqueGames);
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
  }, []);

  return { games, allGames, loading, error, refetch: fetchGames };
};

// Hook for bestseller games (returns unique games for customer view)
export const useBestsellers = (limit: number = 6) => {
  const [bestsellers, setBestsellers] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBestsellers = async () => {
    try {
      setLoading(true);
      const bestsellersData = await gamesService.getBestsellers(limit * 2); // Get more to account for filtering
      
      // Filter to show only unique games (primary editions)
      const uniqueBestsellers = getUniqueGamesForCustomer(bestsellersData).slice(0, limit);
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

// Hook for all games data (for admin use - includes all editions)
export const useAllGames = () => {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllGames = async () => {
    try {
      setLoading(true);
      const gamesData = await gamesService.getAll();
      setAllGames(gamesData);
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

// Hook for subscriptions data
export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const subscriptionsData = await subscriptionsService.getAll();
      setSubscriptions(subscriptionsData);
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
  }, []);

  return { subscriptions, loading, error, refetch: fetchSubscriptions };
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