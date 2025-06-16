import { useState, useEffect } from 'react';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';

// Hook for games data
export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const gamesData = await gamesService.getAll();
      setGames(gamesData);
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

  return { games, loading, error, refetch: fetchGames };
};

// Hook for bestseller games
export const useBestsellers = (limit: number = 6) => {
  const [bestsellers, setBestsellers] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBestsellers = async () => {
    try {
      setLoading(true);
      const bestsellersData = await gamesService.getBestsellers(limit);
      setBestsellers(bestsellersData);
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