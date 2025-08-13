import { openDB } from 'idb';
import { supabase } from '../config/supabase';
import { Game, PaginatedResponse, GameFilters } from '../types';
 
// Cache config
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms
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
  return isExpired ? null : cached.data;
}

async function saveToCache(key: string, data: any) {
  const db = await initDB();
  await db.put(STORE_NAME, { data, timestamp: Date.now() }, key);
}

async function clearCache() {
  const db = await initDB();
  await db.clear(STORE_NAME);
}

export const gamesService = {

  // Get all games
  async getAll(filters: GameFilters = {}): Promise<PaginatedResponse<Game>> {
    try {
      const cacheKey = `getAll:${JSON.stringify(filters)}`;
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;

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
      await clearCache(); // clear cache after add
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
      await clearCache(); // clear cache after update

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
      await clearCache(); // clear cache after delete

    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }
};
