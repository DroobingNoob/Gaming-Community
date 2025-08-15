import { supabase, Game, Testimonial } from '../config/supabase';
import { openDB } from 'idb'; 

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
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const DB_NAME = 'gamesCache';
const STORE_NAME = 'games'; 

async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

async function getFromCache(key: string) {
  const db = await initDB();
  const cached = await db.get(STORE_NAME, key);
  if (!cached) return null;
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) return null;
  console.log(`[Cache] Fetched from cache: ${key}`);
  return cached.data;
}

async function saveToCache(key: string, data: any) {
  const db = await initDB();
  await db.put(STORE_NAME, { data, timestamp: Date.now() }, key);
}

async function removeCacheKey(key: string) {
  const db = await initDB();
  await db.delete(STORE_NAME, key);
}

async function getAllKeys() {
  const db = await initDB();
  return db.getAllKeys(STORE_NAME);
}

// Remove any cache entry that contains a specific game ID
async function removeCacheEntriesContainingGame(gameId: string) {
  const db = await initDB();
  const keys = await db.getAllKeys(STORE_NAME);
  for (const key of keys) {
    const cached = await db.get(STORE_NAME, key);
    if (cached?.data?.data) {
      // For PaginatedResponse caches
      if (cached.data.data.some((g: Game) => g.id === gameId)) {
        await db.delete(STORE_NAME, key);
        console.log(`[Cache] Removed key: ${key} (contained game ${gameId})`);
      }
    } else if (Array.isArray(cached?.data)) {
      // For bestseller arrays
      if (cached.data.some((g: Game) => g.id === gameId)) {
        await db.delete(STORE_NAME, key);
        console.log(`[Cache] Removed key: ${key} (contained game ${gameId})`);
      }
    }
  }
}

export const gamesService = {

  // Get all games
  async getAll(filters: GameFilters = {}): Promise<PaginatedResponse<Game>> {
    try {
      const cacheKey = `getAll:${JSON.stringify(filters)}`;
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;

      console.log(`[Supabase] Fetching from Supabase for key: ${cacheKey}`);

      const {
        searchQuery = '',
        platform = 'all',
        priceRange = [0, 10000],
        sortBy = 'name-asc',
        page = 1,
        limit = 24
      } = filters;

      let query = supabase
        .from('games')
        .select('id, title, image, original_price, sale_price, rent_1_month, rent_3_months, rent_6_months, rent_12_months, permanent_offline_price, permanent_online_price, platform, discount, description, type, category, show_in_bestsellers, edition, base_game_id, edition_features, is_recommended', { count: 'exact' })
        .eq('category', 'game');

      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);
      if (platform !== 'all') query = query.contains('platform', [platform]);
      query = query.gte('rent_1_month', priceRange[0]).lte('rent_1_month', priceRange[1]);

      switch (sortBy) {
        case 'name-asc': query = query.order('title', { ascending: true }); break;
        case 'name-desc': query = query.order('title', { ascending: false }); break;
        case 'price-low': query = query.order('rent_1_month', { ascending: true }); break;
        case 'price-high': query = query.order('rent_1_month', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const result = {
        data: data || [],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
      };

      await saveToCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching games:', error);
      return { data: [], count: 0, totalPages: 0, currentPage: 1 };
    }
  },

  // Get bestseller games
  async getBestsellers(limitCount: number = 6): Promise<Game[]> {
    try {
      const cacheKey = `bestsellers:${limitCount}`;
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;

      console.log(`[Supabase] Fetching from Supabase for key: ${cacheKey}`);

      const { data, error } = await supabase
        .from('games')
        .select('id, title, image, original_price, sale_price, rent_1_month, rent_3_months, rent_6_months, rent_12_months, permanent_offline_price, permanent_online_price, platform, discount, description, type, category, edition, base_game_id, edition_features, is_recommended')
        .eq('category', 'game')
        .eq('show_in_bestsellers', true)
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (error) throw error;
      await saveToCache(cacheKey, data || []);
      return data || [];

    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      return [];
    }
  },

  // Add new game
  async add(game: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([{ ...game, category: 'game' }])
        .select('id')
        .single();

      if (error) throw error;

      console.log(`[Cache] Clearing all caches after adding a game`);
      const keys = await getAllKeys();
      for (const key of keys) await removeCacheKey(String(key));

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
        .update({ ...game, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      console.log(`[Cache] Partial invalidation for game ID: ${id}`);
      await removeCacheEntriesContainingGame(id);

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

      if (error) throw error;
      console.log(`[Cache] Partial invalidation for deleted game ID: ${id}`);
      await removeCacheEntriesContainingGame(id);

    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }
};

// Subscriptions Service
// Subscriptions Service
export const subscriptionsService = {
  // Get all subscriptions
  async getAll(filters: GameFilters = {}): Promise<PaginatedResponse<Game>> {
    try {
      const cacheKey = `subscriptions:getAll:${JSON.stringify(filters)}`;
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;

      console.log(`[Supabase] Fetching subscriptions for key: ${cacheKey}`);

      const {
        searchQuery = '',
        priceRange = [0, 10000],
        sortBy = 'name-asc',
        page = 1,
        limit = 24
      } = filters;

      let query = supabase
        .from('games')
        .select(
          'id, title, image, original_price, sale_price, rent_1_month, rent_3_months, rent_6_months, rent_12_months, platform, discount, description, type, category',
          { count: 'exact' }
        )
        .eq('category', 'subscription');

      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);
      query = query
        .gte('sale_price', priceRange[0])
        .lte('sale_price', priceRange[1]);

      switch (sortBy) {
        case 'name-asc': query = query.order('title', { ascending: true }); break;
        case 'name-desc': query = query.order('title', { ascending: false }); break;
        case 'price-low': query = query.order('sale_price', { ascending: true }); break;
        case 'price-high': query = query.order('sale_price', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const result = {
        data: data || [],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
      };

      await saveToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return { data: [], count: 0, totalPages: 0, currentPage: 1 };
    }
  },

  // Add new subscription
  async add(subscription: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([
          {
            ...subscription,
            category: 'subscription',
            platform: ['Subscription'],
            type: ['Rent']
          }
        ])
        .select('id')
        .single();

      if (error) throw error;

      console.log(`[Cache] Clearing all subscription caches after adding`);
      const keys = await getAllKeys();
      for (const key of keys) {
        if (String(key).startsWith('subscriptions:')) {
          await removeCacheKey(String(key));
        }
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
        .update({ ...subscription, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      console.log(`[Cache] Partial invalidation for subscription ID: ${id}`);
      await removeCacheEntriesContainingGame(id);
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

      if (error) throw error;

      console.log(`[Cache] Partial invalidation for deleted subscription ID: ${id}`);
      await removeCacheEntriesContainingGame(id);
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }
};
 
// Testimonials Service
// Testimonials Service
export const testimonialsService = {
  // Get all testimonials
  async getAll(): Promise<Testimonial[]> {
    const cacheKey = `testimonials:getAll`;

    try {
      // Try cache first
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;

      console.log(`[Supabase] Fetching testimonials for key: ${cacheKey}`);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      await saveToCache(cacheKey, data || []);
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

      if (error) throw error;

      console.log(`[Cache] Clearing testimonials cache after adding`);
      const keys = await getAllKeys();
      for (const key of keys) {
        if (String(key).startsWith('testimonials:')) {
          await removeCacheKey(String(key));
        }
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

      if (error) throw error;

      console.log(`[Cache] Partial invalidation for testimonial ID: ${id}`);
      await removeCacheEntriesContainingGame(id); // Rename helper to something generic if used for testimonials too
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

      if (error) throw error;

      console.log(`[Cache] Partial invalidation for deleted testimonial ID: ${id}`);
      await removeCacheEntriesContainingGame(id); // same helper issue here
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }
};
  