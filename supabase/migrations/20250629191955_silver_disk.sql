/*
  # Add Game Editions Support

  1. Schema Changes
    - Add `edition` column to games table to specify Standard/Premium/Deluxe etc.
    - Add `base_game_id` column to link different editions of the same game
    - Add `edition_features` column for edition-specific features
    - Update indexes for better performance

  2. Data Structure
    - Each game can have multiple editions (Standard, Premium, Deluxe, etc.)
    - Editions are linked by base_game_id
    - Each edition has its own pricing and features
*/

-- Add edition-related columns to games table
DO $$
BEGIN
  -- Add edition column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'edition'
  ) THEN
    ALTER TABLE games ADD COLUMN edition TEXT DEFAULT 'Standard';
  END IF;

  -- Add base_game_id to link different editions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'base_game_id'
  ) THEN
    ALTER TABLE games ADD COLUMN base_game_id UUID;
  END IF;

  -- Add edition-specific features
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'edition_features'
  ) THEN
    ALTER TABLE games ADD COLUMN edition_features TEXT[];
  END IF;

  -- Add base_title for grouping editions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'base_title'
  ) THEN
    ALTER TABLE games ADD COLUMN base_title TEXT;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_edition ON games(edition);
CREATE INDEX IF NOT EXISTS idx_games_base_game_id ON games(base_game_id);
CREATE INDEX IF NOT EXISTS idx_games_base_title ON games(base_title);

-- Update existing games to have proper base_title and edition
UPDATE games 
SET 
  base_title = title,
  edition = 'Standard'
WHERE base_title IS NULL OR edition IS NULL;

-- Insert sample game editions
DO $$
DECLARE
  spiderman_base_id UUID;
  gow_base_id UUID;
  horizon_base_id UUID;
BEGIN
  -- Check if we already have edition examples
  IF NOT EXISTS (SELECT 1 FROM games WHERE edition != 'Standard' LIMIT 1) THEN
    
    -- Get existing game IDs to use as base games
    SELECT id INTO spiderman_base_id FROM games WHERE title LIKE '%Spider-Man%' LIMIT 1;
    SELECT id INTO gow_base_id FROM games WHERE title LIKE '%God of War%' LIMIT 1;
    SELECT id INTO horizon_base_id FROM games WHERE title LIKE '%Horizon%' LIMIT 1;

    -- Update existing games to be Standard editions
    IF spiderman_base_id IS NOT NULL THEN
      UPDATE games 
      SET 
        base_title = 'Spider-Man: Miles Morales',
        edition = 'Standard',
        base_game_id = spiderman_base_id
      WHERE id = spiderman_base_id;

      -- Add Premium edition for Spider-Man
      INSERT INTO games (
        title, base_title, edition, base_game_id,
        image, original_price, sale_price,
        rent_1_month, rent_3_months, rent_6_months,
        permanent_offline_price, permanent_online_price,
        platform, discount, description, type, category, show_in_bestsellers,
        edition_features
      ) VALUES (
        'Spider-Man: Miles Morales - Premium Edition',
        'Spider-Man: Miles Morales',
        'Premium',
        spiderman_base_id,
        'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
        6999.00, 4499.00,
        449.00, 1199.00, 2299.00,
        4499.00, 4999.00,
        ARRAY['PS5'], 36,
        'Experience the rise of Miles Morales with exclusive premium content and bonuses.',
        ARRAY['Rent', 'Permanent Offline', 'Permanent Offline + Online'], 'game', true,
        ARRAY['Season Pass', 'Exclusive Suits', 'Digital Soundtrack', 'Art Book', 'Early Access']
      );
    END IF;

    -- Add Premium edition for God of War
    IF gow_base_id IS NOT NULL THEN
      UPDATE games 
      SET 
        base_title = 'God of War Ragnarök',
        edition = 'Standard',
        base_game_id = gow_base_id
      WHERE id = gow_base_id;

      INSERT INTO games (
        title, base_title, edition, base_game_id,
        image, original_price, sale_price,
        rent_1_month, rent_3_months, rent_6_months,
        permanent_offline_price, permanent_online_price,
        platform, discount, description, type, category, show_in_bestsellers,
        edition_features
      ) VALUES (
        'God of War Ragnarök - Premium Edition',
        'God of War Ragnarök',
        'Premium',
        gow_base_id,
        'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
        7999.00, 5499.00,
        549.00, 1499.00, 2899.00,
        5499.00, 5999.00,
        ARRAY['PS5'], 31,
        'Kratos and Atreus embark on a mythic journey with exclusive premium content.',
        ARRAY['Rent', 'Permanent Offline', 'Permanent Offline + Online'], 'game', true,
        ARRAY['DLC Pack', 'Exclusive Armor Sets', 'Digital Soundtrack', 'Behind the Scenes', 'Concept Art']
      );
    END IF;

    -- Add Deluxe edition for Horizon
    IF horizon_base_id IS NOT NULL THEN
      UPDATE games 
      SET 
        base_title = 'Horizon Forbidden West',
        edition = 'Standard',
        base_game_id = horizon_base_id
      WHERE id = horizon_base_id;

      INSERT INTO games (
        title, base_title, edition, base_game_id,
        image, original_price, sale_price,
        rent_1_month, rent_3_months, rent_6_months,
        permanent_offline_price, permanent_online_price,
        platform, discount, description, type, category, show_in_bestsellers,
        edition_features
      ) VALUES (
        'Horizon Forbidden West - Deluxe Edition',
        'Horizon Forbidden West',
        'Deluxe',
        horizon_base_id,
        'https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
        6999.00, 3999.00,
        399.00, 1099.00, 2099.00,
        3999.00, 4499.00,
        ARRAY['PS5'], 43,
        'Join Aloy in the Forbidden West with exclusive deluxe content and expansions.',
        ARRAY['Rent', 'Permanent Offline', 'Permanent Offline + Online'], 'game', true,
        ARRAY['Burning Shores DLC', 'Exclusive Outfits', 'Weapon Packs', 'Digital Soundtrack', 'Photo Mode Pack']
      );
    END IF;
  END IF;
END $$;