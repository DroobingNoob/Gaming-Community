import { supabase, Game, Testimonial } from '../config/supabase';

// Interface for filtering and pagination parameters
export interface GameFilters {
  searchQuery?: string;
  platform?: string;
  priceRange?: [number, number];
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  totalPages: number;
  currentPage: number;
}

// Games Service
export const gamesService = {
  // Get all games
  async getAll(filters: GameFilters = {}): Promise<PaginatedResponse<Game>> {
    try {
      const {
        searchQuery = '',
        platform = 'all',
        priceRange = [0, 10000],
        sortBy = 'name-asc',
        page = 1,
        limit = 24
      } = filters;

      // Build query with only necessary columns
      let query = supabase
        .from('games')
        .select('id, title, image, original_price, sale_price, rent_1_month, rent_3_months, rent_6_months, permanent_offline_price, permanent_online_price, platform, discount, description, type, category, show_in_bestsellers, edition, base_game_id, edition_features, is_recommended', { count: 'exact' })
        .eq('category', 'game');

      // Apply search filter
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      // Apply platform filter
      if (platform !== 'all') {
        query = query.contains('platform', [platform]);
      }

      // Apply price range filter (using rent_1_month as default price for filtering)
      query = query.gte('rent_1_month', priceRange[0]).lte('rent_1_month', priceRange[1]);

      // Apply sorting
      switch (sortBy) {
        case 'name-asc':
          query = query.order('title', { ascending: true });
          break;
        case 'name-desc':
          query = query.order('title', { ascending: false });
          break;
        case 'price-low':
          query = query.order('rent_1_month', { ascending: true });
          break;
        case 'price-high':
          query = query.order('rent_1_month', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: data || [],
        count: count || 0,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching games:', error);
      return {
        data: [],
        count: 0,
        totalPages: 0,
        currentPage: 1
      };
    }
  },

  // Get bestseller games (only those marked as bestsellers)
  async getBestsellers(limitCount: number = 6): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id, title, image, original_price, sale_price, rent_1_month, rent_3_months, rent_6_months, permanent_offline_price, permanent_online_price, platform, discount, description, type, category, edition, base_game_id, edition_features')
        .eq('category', 'game')
        .eq('show_in_bestsellers', true)
        .order('created_at', { ascending: false })
        .limit(limitCount); // Use exact limit, not limit * 2

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      return [];
    }
  },

  // Add new game
  async add(game: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      // Insert without authentication check - let RLS handle it
      const { data, error } = await supabase
        .from('games')
        .insert([{
          ...game,
          category: 'game'
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data.id;
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  },

  // Update game
  async update(id: string, game: Partial<Game>): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          ...game,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  },

  // Delete game
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }
};

// Subscriptions Service
export const subscriptionsService = {
  // Get all subscriptions
  async getAll(filters: GameFilters = {}): Promise<PaginatedResponse<Game>> {
    try {
      const {
        searchQuery = '',
        priceRange = [0, 10000],
        sortBy = 'name-asc',
        page = 1,
        limit = 24
      } = filters;

      // Build query with only necessary columns
      let query = supabase
        .from('games')
        .select('id, title, image, original_price, sale_price, platform, discount, description, type, category', { count: 'exact' })
        .eq('category', 'subscription');

      // Apply search filter
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      // Apply price range filter
      query = query.gte('sale_price', priceRange[0]).lte('sale_price', priceRange[1]);

      // Apply sorting
      switch (sortBy) {
        case 'name-asc':
          query = query.order('title', { ascending: true });
          break;
        case 'name-desc':
          query = query.order('title', { ascending: false });
          break;
        case 'price-low':
          query = query.order('sale_price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('sale_price', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: data || [],
        count: count || 0,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return {
        data: [],
        count: 0,
        totalPages: 0,
        currentPage: 1
      };
    }
  },

  // Add new subscription
  async add(subscription: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([{
          ...subscription,
          category: 'subscription'
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data.id;
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  },

  // Update subscription
  async update(id: string, subscription: Partial<Game>): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          ...subscription,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Delete subscription
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }
};

// Testimonials Service
export const testimonialsService = {
  // Get all testimonials
  async getAll(): Promise<Testimonial[]> {
    try {
      console.log('Fetching testimonials from Supabase...');
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase testimonials response:', { data, error });
      console.log('Data length:', data?.length || 0);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  },

  // Add new testimonial
  async add(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([testimonial])
        .select('id')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data.id;
    } catch (error) {
      console.error('Error adding testimonial:', error);
      throw error;
    }
  },

  // Update testimonial
  async update(id: string, testimonial: Partial<Testimonial>): Promise<void> {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          ...testimonial,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  },

  // Delete testimonial
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }
};