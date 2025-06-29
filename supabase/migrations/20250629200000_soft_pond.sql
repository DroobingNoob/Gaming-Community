-- Update the games table structure for proper edition-based pricing
-- This migration ensures each edition can have completely different pricing

-- First, let's make sure all required columns exist
DO $$
BEGIN
  -- Ensure edition column exists with proper default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'edition'
  ) THEN
    ALTER TABLE games ADD COLUMN edition TEXT DEFAULT 'Standard';
  END IF;

  -- Ensure base_game_id exists for linking editions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'base_game_id'
  ) THEN
    ALTER TABLE games ADD COLUMN base_game_id UUID;
  END IF;

  -- Ensure edition_features exists for Premium edition features
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'edition_features'
  ) THEN
    ALTER TABLE games ADD COLUMN edition_features TEXT[];
  END IF;
END $$;

-- Update existing games to have proper edition values
UPDATE games 
SET edition = 'Standard'
WHERE edition IS NULL OR edition NOT IN ('Standard', 'Premium');

-- Clean up any existing Premium editions that might have wrong titles
UPDATE games 
SET title = REGEXP_REPLACE(title, ' - (Standard|Premium|Deluxe) Edition$', '', 'i')
WHERE title ~ ' - (Standard|Premium|Deluxe) Edition$';

-- Create a function to generate Premium edition with different pricing
CREATE OR REPLACE FUNCTION create_premium_edition(
  base_game_id UUID,
  title TEXT,
  image TEXT,
  description TEXT,
  platform TEXT[],
  type TEXT[],
  category TEXT,
  show_in_bestsellers BOOLEAN,
  -- Standard edition pricing
  std_original_price DECIMAL(10,2),
  std_sale_price DECIMAL(10,2),
  std_rent_1_month DECIMAL(10,2),
  std_rent_3_months DECIMAL(10,2),
  std_rent_6_months DECIMAL(10,2),
  std_permanent_offline_price DECIMAL(10,2),
  std_permanent_online_price DECIMAL(10,2),
  -- Premium edition pricing multipliers
  premium_price_multiplier DECIMAL(3,2) DEFAULT 1.5,
  premium_features TEXT[] DEFAULT ARRAY['Season Pass', 'Exclusive Content', 'Digital Soundtrack', 'Art Book', 'Early Access']
) RETURNS UUID AS $$
DECLARE
  new_game_id UUID;
  premium_original_price DECIMAL(10,2);
  premium_sale_price DECIMAL(10,2);
  premium_discount INTEGER;
BEGIN
  -- Calculate Premium edition pricing
  premium_original_price := ROUND(std_original_price * premium_price_multiplier, 2);
  premium_sale_price := ROUND(std_sale_price * premium_price_multiplier, 2);
  premium_discount := ROUND(((premium_original_price - premium_sale_price) / premium_original_price) * 100);

  -- Insert Premium edition
  INSERT INTO games (
    title, edition, base_game_id,
    image, original_price, sale_price,
    rent_1_month, rent_3_months, rent_6_months,
    permanent_offline_price, permanent_online_price,
    platform, discount, description, type, category, show_in_bestsellers,
    edition_features
  ) VALUES (
    title, 'Premium', base_game_id,
    image, premium_original_price, premium_sale_price,
    CASE WHEN std_rent_1_month IS NOT NULL THEN ROUND(std_rent_1_month * premium_price_multiplier, 2) ELSE NULL END,
    CASE WHEN std_rent_3_months IS NOT NULL THEN ROUND(std_rent_3_months * premium_price_multiplier, 2) ELSE NULL END,
    CASE WHEN std_rent_6_months IS NOT NULL THEN ROUND(std_rent_6_months * premium_price_multiplier, 2) ELSE NULL END,
    CASE WHEN std_permanent_offline_price IS NOT NULL THEN ROUND(std_permanent_offline_price * premium_price_multiplier, 2) ELSE NULL END,
    CASE WHEN std_permanent_online_price IS NOT NULL THEN ROUND(std_permanent_online_price * premium_price_multiplier, 2) ELSE NULL END,
    platform, premium_discount, description, type, category, show_in_bestsellers,
    premium_features
  ) RETURNING id INTO new_game_id;

  RETURN new_game_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing Standard editions to have proper base_game_id
UPDATE games 
SET base_game_id = id
WHERE edition = 'Standard' AND base_game_id IS NULL;

-- Create Premium editions for existing Standard games that don't have them
DO $$
DECLARE
  game_record RECORD;
  premium_id UUID;
BEGIN
  FOR game_record IN 
    SELECT id, title, image, description, platform, type, category, show_in_bestsellers,
           original_price, sale_price, rent_1_month, rent_3_months, rent_6_months,
           permanent_offline_price, permanent_online_price
    FROM games 
    WHERE category = 'game' AND edition = 'Standard'
  LOOP
    -- Check if Premium edition already exists
    IF NOT EXISTS (
      SELECT 1 FROM games 
      WHERE title = game_record.title AND edition = 'Premium'
    ) THEN
      -- Create Premium edition with 50% higher pricing
      SELECT create_premium_edition(
        game_record.id,
        game_record.title,
        game_record.image,
        game_record.description,
        game_record.platform,
        game_record.type,
        game_record.category,
        game_record.show_in_bestsellers,
        game_record.original_price,
        game_record.sale_price,
        game_record.rent_1_month,
        game_record.rent_3_months,
        game_record.rent_6_months,
        game_record.permanent_offline_price,
        game_record.permanent_online_price,
        1.5, -- 50% higher pricing
        ARRAY['Season Pass', 'Exclusive Content', 'Digital Soundtrack', 'Art Book', 'Early Access']
      ) INTO premium_id;
    END IF;
  END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_edition ON games(edition);
CREATE INDEX IF NOT EXISTS idx_games_base_game_id ON games(base_game_id);
CREATE INDEX IF NOT EXISTS idx_games_title_edition ON games(title, edition);

-- Drop the function as it's no longer needed
DROP FUNCTION IF EXISTS create_premium_edition;

-- Add a constraint to ensure edition values are valid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'games_edition_check' AND table_name = 'games'
  ) THEN
    ALTER TABLE games ADD CONSTRAINT games_edition_check 
    CHECK (edition IN ('Standard', 'Premium'));
  END IF;
END $$;