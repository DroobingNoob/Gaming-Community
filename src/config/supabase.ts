// Temporary Supabase replacement file.
// Keep this file name for now so existing imports do not break while we migrate.

const createNoopSubscription = () => ({
  unsubscribe: () => {},
});

export const supabase: any = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: createNoopSubscription() },
    }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: new Error("Supabase auth has been disabled during migration."),
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: new Error("Supabase auth has been disabled during migration."),
    }),
    signInWithOAuth: async () => ({
      data: null,
      error: new Error("Supabase auth has been disabled during migration."),
    }),
    updateUser: async () => ({
      data: { user: null },
      error: new Error("Supabase auth has been disabled during migration."),
    }),
    signOut: async () => ({ error: null }),
  },
  channel: () => ({
    on: () => ({
      subscribe: () => createNoopSubscription(),
    }),
  }),
};

export interface GamePlatformPrice {
  id?: string;
  platform: string;
  original_price?: number | null;
  sale_price?: number | null;
  rent_1_month?: number | null;
  rent_3_months?: number | null;
  rent_6_months?: number | null;
  rent_12_months?: number | null;
  permanent_offline_price?: number | null;
  permanent_online_price?: number | null;
  created_at?: string;
  updated_at?: string;
}

// Database types
export interface Game {
  id?: string;
  title: string;
  edition?: "Standard" | "Premium" | "Ultimate" | "Deluxe";
  base_game_id?: string | null;
  edition_features?: string[];
  image: string;
  description: string;
  type: string[];
  category: "game" | "subscription";
  show_in_bestsellers?: boolean;
  is_recommended?: boolean;
  created_at?: string;
  updated_at?: string;
  platform_prices: GamePlatformPrice[];
}

export interface Testimonial {
  id?: string;
  image: string;
  created_at?: string;
  updated_at?: string;
}

export const getPlatformsForGame = (game: Game): string[] => {
  return (game.platform_prices || []).map((p) => p.platform);
};

export const getPlatformPricing = (
  game: Game,
  selectedPlatform: string
): GamePlatformPrice | undefined => {
  return (game.platform_prices || []).find(
    (p) => p.platform === selectedPlatform
  );
};

// Helper function to calculate discount percentage for games
export const calculateGameDiscount = (
  originalPrice: number,
  currentPrice: number
): number => {
  if (originalPrice <= 0 || currentPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Helper function to get the display price for games based on selected type
export const getGameDisplayPrice = (
  game: Game,
  selectedPlatform: string,
  selectedType: string,
  selectedRentDuration?: string
): number => {
  const pricing = getPlatformPricing(game, selectedPlatform);
  if (!pricing) return 0;

  if (game.category === "subscription") {
    return pricing.sale_price || pricing.original_price || 0;
  }

  if (selectedType === "Rent") {
    const rentPrices = {
      "1_month": pricing.rent_1_month || 0,
      "3_months": pricing.rent_3_months || 0,
      "6_months": pricing.rent_6_months || 0,
      "12_months": pricing.rent_12_months || 0,
    };

    return (
      rentPrices[selectedRentDuration as keyof typeof rentPrices] ||
      pricing.rent_1_month ||
      0
    );
  }

  if (selectedType === "Permanent Offline") {
    return pricing.permanent_offline_price || pricing.original_price || 0;
  }

  if (selectedType === "Permanent Offline + Online") {
    return pricing.permanent_online_price || pricing.original_price || 0;
  }

  return (
    pricing.rent_1_month ||
    pricing.permanent_offline_price ||
    pricing.permanent_online_price ||
    pricing.sale_price ||
    pricing.original_price ||
    0
  );
};

// Helper function to get discount percentage for display
export const getGameDiscountPercentage = (
  game: Game,
  selectedPlatform: string,
  selectedType: string,
  selectedRentDuration?: string
): number => {
  const pricing = getPlatformPricing(game, selectedPlatform);
  if (!pricing) return 0;

  const originalPrice =
    pricing.original_price ||
    pricing.sale_price ||
    pricing.permanent_offline_price ||
    pricing.permanent_online_price ||
    0;

  const currentPrice = getGameDisplayPrice(
    game,
    selectedPlatform,
    selectedType,
    selectedRentDuration
  );

  return calculateGameDiscount(originalPrice, currentPrice);
};

export const getStartingPrice = (game: Game): number => {
  const prices = (game.platform_prices || [])
    .flatMap((p) => [
      p.rent_1_month,
      p.rent_3_months,
      p.rent_6_months,
      p.rent_12_months,
      p.permanent_offline_price,
      p.permanent_online_price,
      p.sale_price,
      p.original_price,
    ])
    .filter((v): v is number => typeof v === "number" && v > 0);

  return prices.length ? Math.min(...prices) : 0;
};

// Helper function to get available editions for a game
export const getGameEditions = (games: Game[], baseGameId: string): Game[] => {
  let editions = games.filter(
    (game) =>
      game.base_game_id === baseGameId ||
      game.id === baseGameId ||
      (game.base_game_id && game.base_game_id === baseGameId)
  );

  if (editions.length <= 1) {
    const baseGame = games.find((game) => game.id === baseGameId);
    if (baseGame) {
      editions = games.filter((game) => game.title === baseGame.title);
    }
  }

  return editions.sort((a, b) => {
    const editionOrder = {
      Standard: 1,
      Premium: 2,
      Ultimate: 3,
      Deluxe: 4,
    };
    const aOrder = editionOrder[a.edition as keyof typeof editionOrder] || 999;
    const bOrder = editionOrder[b.edition as keyof typeof editionOrder] || 999;
    return aOrder - bOrder;
  });
};

// Helper function to get the primary edition of a game
export const getPrimaryEdition = (
  games: Game[],
  gameTitle: string
): Game | null => {
  const editions = games.filter((game) => game.title === gameTitle);

  if (editions.length === 0) return null;

  const standardEdition = editions.find((game) => game.edition === "Standard");
  return standardEdition || editions[0];
};

// Helper function to group games by title
export const groupGamesByTitle = (
  games: Game[]
): { [title: string]: Game[] } => {
  return games.reduce((groups, game) => {
    if (!groups[game.title]) {
      groups[game.title] = [];
    }
    groups[game.title].push(game);
    return groups;
  }, {} as { [title: string]: Game[] });
};

// Helper function to get unique games for customer
export const getUniqueGamesForCustomer = (games: Game[]): Game[] => {
  const gameGroups = groupGamesByTitle(games);
  const uniqueGames: Game[] = [];

  Object.keys(gameGroups).forEach((title) => {
    const primaryEdition = getPrimaryEdition(games, title);
    if (primaryEdition) {
      uniqueGames.push(primaryEdition);
    }
  });

  return uniqueGames.sort((a, b) => {
    const aDate = new Date(a.created_at || 0);
    const bDate = new Date(b.created_at || 0);
    return bDate.getTime() - aDate.getTime();
  });
};

// Helper function to get cheapest edition
export const getCheapestEdition = (
  games: Game[],
  gameTitle: string
): Game | null => {
  const editions = games.filter((game) => game.title === gameTitle);

  if (editions.length === 0) return null;

  return editions.reduce((cheapest, current) => {
    const cheapestPrice = getStartingPrice(cheapest);
    const currentPrice = getStartingPrice(current);
    return currentPrice < cheapestPrice ? current : cheapest;
  });
};

// Helper function to find all editions by game id
export const findAllEditionsByGameId = (
  games: Game[],
  gameId: string
): Game[] => {
  const targetGame = games.find((game) => game.id === gameId);
  if (!targetGame) return [];

  const sameTitle = games.filter((game) => game.title === targetGame.title);

  const baseGameId = targetGame.base_game_id || targetGame.id;
  const relatedByBaseId = games.filter(
    (game) =>
      game.base_game_id === baseGameId ||
      game.id === baseGameId ||
      (game.base_game_id && game.base_game_id === targetGame.base_game_id)
  );

  const editions =
    relatedByBaseId.length > sameTitle.length ? relatedByBaseId : sameTitle;

  return editions.sort((a, b) => {
    const editionOrder = {
      Standard: 1,
      Premium: 2,
      Ultimate: 3,
      Deluxe: 4,
    };
    const aOrder = editionOrder[a.edition as keyof typeof editionOrder] || 999;
    const bOrder = editionOrder[b.edition as keyof typeof editionOrder] || 999;
    return aOrder - bOrder;
  });
};