import {
  Game,
  Testimonial,
  GamePlatformPrice,
  getStartingPrice,
} from "../config/supabase";
import { openDB } from "idb";

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

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// Games Service
const CACHE_TTL = 60 * 60 * 1000;
const DB_NAME = "gamesCache";
const STORE_NAME = "games";

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

async function removeCacheEntriesContainingGame(gameId: string) {
  const db = await initDB();
  const keys = await db.getAllKeys(STORE_NAME);

  for (const key of keys) {
    const cached = await db.get(STORE_NAME, key);

    if (cached?.data?.data) {
      if (cached.data.data.some((g: Game) => g.id === gameId)) {
        await db.delete(STORE_NAME, key);
      }
    } else if (Array.isArray(cached?.data)) {
      if (cached.data.some((g: Game) => g.id === gameId)) {
        await db.delete(STORE_NAME, key);
      }
    }
  }
}

function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function normalizePlatformPrice(raw: any): GamePlatformPrice {
  return {
    ...raw,
    original_price: parseNumber(raw.original_price),
    sale_price: parseNumber(raw.sale_price),
    rent_1_month: parseNumber(raw.rent_1_month),
    rent_3_months: parseNumber(raw.rent_3_months),
    rent_6_months: parseNumber(raw.rent_6_months),
    rent_12_months: parseNumber(raw.rent_12_months),
    permanent_offline_price: parseNumber(raw.permanent_offline_price),
    permanent_online_price: parseNumber(raw.permanent_online_price),
  };
}

function normalizeGame(raw: any): Game {
  return {
    ...raw,
    type: Array.isArray(raw.type) ? raw.type : [],
    edition_features: Array.isArray(raw.edition_features)
      ? raw.edition_features
      : [],
    show_in_bestsellers: Boolean(raw.show_in_bestsellers),
    is_recommended: Boolean(raw.is_recommended),
    platform_prices: Array.isArray(raw.platform_prices)
      ? raw.platform_prices.map(normalizePlatformPrice)
      : [],
  };
}

function filterAndPaginateGames(
  allGames: Game[],
  filters: GameFilters,
  category: "game" | "subscription"
): PaginatedResponse<Game> {
  const {
    searchQuery = "",
    platform = "all",
    priceRange = [0, 10000],
    sortBy = "name-asc",
    page = 1,
    limit = 24,
  } = filters;

  let filtered = allGames.filter((game) => game.category === category);

  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    filtered = filtered.filter((game) =>
      game.title.toLowerCase().includes(query)
    );
  }

if (category === "game" && platform !== "all") {
  filtered = filtered.filter((game) =>
    (game.platform_prices || []).some((p) => p.platform === platform)
  );
}
if (category === "subscription") {
  filtered = filtered.filter((game) => {
    const price = getStartingPrice(game);
    return price >= priceRange[0] && price <= priceRange[1];
  });
}
  switch (sortBy) {
    case "name-asc":
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "name-desc":
      filtered.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "price-low":
  filtered.sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
  break;
    case "price-high":
  filtered.sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
  break;
    default:
      filtered.sort((a, b) => {
        const aDate = new Date(a.created_at || 0).getTime();
        const bDate = new Date(b.created_at || 0).getTime();
        return bDate - aDate;
      });
      break;
  }

  const count = filtered.length;
  const totalPages = Math.ceil(count / limit) || 1;
  const from = (page - 1) * limit;
  const to = from + limit;

  return {
    data: filtered.slice(from, to),
    count,
    totalPages,
    currentPage: page,
  };
}

async function fetchAllGamesFromApi(): Promise<Game[]> {
  const response = await fetch(`${API_URL}/games`);

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeGame) : [];
}

export const gamesService = {
  async getAll(filters: GameFilters = {}): Promise<PaginatedResponse<Game>> {
    try {
      const cacheKey = `getAll:${JSON.stringify(filters)}`;
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;

      const allGames = await fetchAllGamesFromApi();
      const result = filterAndPaginateGames(allGames, filters, "game");

      await saveToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error fetching games:", error);
      return { data: [], count: 0, totalPages: 0, currentPage: 1 };
    }
  },

  async getBestsellers(limitCount: number = 6): Promise<Game[]> {
    try {
      const cacheKey = `bestsellers:${limitCount}`;
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;

      const allGames = await fetchAllGamesFromApi();
      const bestsellers = allGames
        .filter(
          (game) => game.category === "game" && game.show_in_bestsellers === true
        )
        .sort((a, b) => {
          const aDate = new Date(a.created_at || 0).getTime();
          const bDate = new Date(b.created_at || 0).getTime();
          return bDate - aDate;
        })
        .slice(0, limitCount);

      await saveToCache(cacheKey, bestsellers);
      return bestsellers;
    } catch (error) {
      console.error("Error fetching bestsellers:", error);
      return [];
    }
  },

  async add(game: Omit<Game, "id" | "created_at" | "updated_at">): Promise<string> {
    const response = await fetch(`${API_URL}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...game,
        category: "game",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add game: ${response.status}`);
    }

    const data = normalizeGame(await response.json());

    const keys = await getAllKeys();
    for (const key of keys) {
      await removeCacheKey(String(key));
    }

    return data.id as string;
  },

  async update(id: string, game: Partial<Game>): Promise<void> {
    const response = await fetch(`${API_URL}/games/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...game,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update game: ${response.status}`);
    }

    await removeCacheEntriesContainingGame(id);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/games/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete game: ${response.status}`);
    }

    await removeCacheEntriesContainingGame(id);
  },
};

export const subscriptionsService = {
  async getAll(filters: GameFilters = {}): Promise<PaginatedResponse<Game>> {
    try {
      const cacheKey = `subscriptions:getAll:${JSON.stringify(filters)}`;
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;

      const allGames = await fetchAllGamesFromApi();
      const result = filterAndPaginateGames(allGames, filters, "subscription");

      await saveToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      return { data: [], count: 0, totalPages: 0, currentPage: 1 };
    }
  },

  async add(subscription: Omit<Game, "id" | "created_at" | "updated_at">): Promise<string> {
    const response = await fetch(`${API_URL}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...subscription,
        category: "subscription",
        platform: ["Subscription"],
        type: ["Rent"],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add subscription: ${response.status}`);
    }

    const data = normalizeGame(await response.json());

    const keys = await getAllKeys();
    for (const key of keys) {
      if (String(key).startsWith("subscriptions:")) {
        await removeCacheKey(String(key));
      }
    }

    return data.id as string;
  },

  async update(id: string, subscription: Partial<Game>): Promise<void> {
    const response = await fetch(`${API_URL}/games/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...subscription,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update subscription: ${response.status}`);
    }

    await removeCacheEntriesContainingGame(id);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/games/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete subscription: ${response.status}`);
    }

    await removeCacheEntriesContainingGame(id);
  },
};

export const testimonialsService = {
  async getAll(): Promise<Testimonial[]> {
    const cacheKey = `testimonials:getAll`;

    try {
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${API_URL}/testimonials`);

      if (!response.ok) {
        throw new Error(`Failed to fetch testimonials: ${response.status}`);
      }

      const data = await response.json();
      const normalized = Array.isArray(data) ? data : [];

      await saveToCache(cacheKey, normalized);
      return normalized;
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      return [];
    }
  },

  async add(
    testimonial: Omit<Testimonial, "id" | "created_at" | "updated_at">
  ): Promise<string> {
    const response = await fetch(`${API_URL}/testimonials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testimonial),
    });

    if (!response.ok) {
      throw new Error(`Failed to add testimonial: ${response.status}`);
    }

    const data = await response.json();

    const keys = await getAllKeys();
    for (const key of keys) {
      if (String(key).startsWith("testimonials:")) {
        await removeCacheKey(String(key));
      }
    }

    return data.id;
  },

  async update(id: string, testimonial: Partial<Testimonial>): Promise<void> {
    // Your current backend does not yet have PUT /testimonials/:id
    // Leave this here so the UI compiles, but don't use it until backend route is added.
    console.warn("Testimonial update route is not implemented yet.", {
      id,
      testimonial,
    });
    throw new Error("Testimonial update route is not implemented yet.");
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/testimonials/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete testimonial: ${response.status}`);
    }

    const keys = await getAllKeys();
    for (const key of keys) {
      if (String(key).startsWith("testimonials:")) {
        await removeCacheKey(String(key));
      }
    }
  },
};