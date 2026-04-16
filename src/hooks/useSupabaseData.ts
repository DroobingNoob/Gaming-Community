import { useState, useEffect } from "react";
import {
  gamesService,
  subscriptionsService,
  testimonialsService,
  GameFilters,
  PaginatedResponse,
} from "../services/supabaseService";
import {
  Game,
  Testimonial,
  getUniqueGamesForCustomer,
} from "../config/supabase";

// Hook for games data with filtering and pagination
export const useGames = (filters: GameFilters = {}) => {
  const [gamesResponse, setGamesResponse] = useState<PaginatedResponse<Game>>({
    data: [],
    count: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);

      const response = await gamesService.getAll(filters);
      setAllGames(response.data);

      const uniqueGames = getUniqueGamesForCustomer(response.data);

      setGamesResponse({
        ...response,
        data: uniqueGames,
      });

      setError(null);
    } catch (err) {
      setError("Failed to fetch games");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [JSON.stringify(filters)]);

  return {
    games: gamesResponse.data,
    totalCount: gamesResponse.count,
    totalPages: gamesResponse.totalPages,
    currentPage: gamesResponse.currentPage,
    allGames,
    loading,
    error,
    refetch: fetchGames,
  };
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
      const uniqueBestsellers = getUniqueGamesForCustomer(bestsellersData);
      setBestsellers(uniqueBestsellers);
      setError(null);
    } catch (err) {
      setError("Failed to fetch bestsellers");
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

// Hook for all games data (admin use)
export const useAllGames = () => {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllGames = async () => {
    try {
      setLoading(true);
      const response = await gamesService.getAll({ limit: 1000 });
      setAllGames(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch all games");
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
export const useSubscriptions = (filters: GameFilters = {}) => {
  const [subscriptionsResponse, setSubscriptionsResponse] =
    useState<PaginatedResponse<Game>>({
      data: [],
      count: 0,
      totalPages: 0,
      currentPage: 1,
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
      setError("Failed to fetch subscriptions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [JSON.stringify(filters)]);

  return {
    subscriptions: subscriptionsResponse.data,
    totalCount: subscriptionsResponse.count,
    totalPages: subscriptionsResponse.totalPages,
    currentPage: subscriptionsResponse.currentPage,
    loading,
    error,
    refetch: fetchSubscriptions,
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
      console.error("Error in useTestimonials hook:", err);
      setError("Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return { testimonials, loading, error, refetch: fetchTestimonials };
};