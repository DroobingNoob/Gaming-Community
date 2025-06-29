-- Update the games table to simplify edition system
-- Remove base_title column as we'll use the same title for all editions
DO $$
BEGIN
  -- Remove base_title column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'base_title'
  ) THEN
    ALTER TABLE games DROP COLUMN base_title;
  END IF;
END $$;

-- Update existing games to have proper edition values
UPDATE games 
SET edition = 'Standard'
WHERE edition IS NULL OR edition NOT IN ('Standard', 'Premium');

-- Clean up any games that might have edition suffixes in their titles
UPDATE games 
SET title = REGEXP_REPLACE(title, ' - (Standard|Premium|Deluxe) Edition$', '', 'i')
WHERE title ~ ' - (Standard|Premium|Deluxe) Edition$';

-- Update sample data to demonstrate the new edition system
DO $$
DECLARE
  spiderman_base_id UUID;
  gow_base_id UUID;
  horizon_base_id UUID;
BEGIN
  -- Get existing game IDs
  SELECT id INTO spiderman_base_id FROM games WHERE title LIKE '%Spider-Man%' AND edition = 'Standard' LIMIT 1;
  SELECT id INTO gow_base_id FROM games WHERE title LIKE '%God of War%' AND edition = 'Standard' LIMIT 1;
  SELECT id INTO horizon_base_id FROM games WHERE title LIKE '%Horizon%' AND edition = 'Standard' LIMIT 1;

  -- Update existing Premium editions to have the same title as Standard
  IF spiderman_base_id IS NOT NULL THEN
    UPDATE games 
    SET title = 'Spider-Man: Miles Morales'
    WHERE base_game_id = spiderman_base_id AND edition = 'Premium';
  END IF;

  IF gow_base_id IS NOT NULL THEN
    UPDATE games 
    SET title = 'God of War Ragnarök'
    WHERE base_game_id = gow_base_id AND edition = 'Premium';
  END IF;

  IF horizon_base_id IS NOT NULL THEN
    UPDATE games 
    SET title = 'Horizon Forbidden West'
    WHERE base_game_id = horizon_base_id AND edition IN ('Premium', 'Deluxe');
    
    -- Update Deluxe to Premium for consistency
    UPDATE games 
    SET edition = 'Premium'
    WHERE base_game_id = horizon_base_id AND edition = 'Deluxe';
  END IF;
END $$;

-- Add some sample Premium editions if they don't exist
DO $$
DECLARE
  game_record RECORD;
BEGIN
  -- For each Standard edition game, check if Premium edition exists
  FOR game_record IN 
    SELECT id, title, image, description, platform, type, category, show_in_bestsellers
    FROM games 
    WHERE category = 'game' AND edition = 'Standard'
  LOOP
    -- Check if Premium edition already exists
    IF NOT EXISTS (
      SELECT 1 FROM games 
      WHERE title = game_record.title AND edition = 'Premium'
    ) THEN
      -- Create Premium edition with higher prices
      INSERT INTO games (
        title, edition, base_game_id,
        image, original_price, sale_price,
        rent_1_month, rent_3_months, rent_6_months,
        permanent_offline_price, permanent_online_price,
        platform, discount, description, type, category, show_in_bestsellers,
        edition_features
      ) 
      SELECT 
        title, 'Premium', id,
        image, 
        ROUND(original_price * 1.4, 2), -- 40% higher original price
        ROUND(sale_price * 1.3, 2), -- 30% higher sale price
        ROUND(COALESCE(rent_1_month, 0) * 1.5, 2), -- 50% higher rent prices
        ROUND(COALESCE(rent_3_months, 0) * 1.5, 2),
        ROUND(COALESCE(rent_6_months, 0) * 1.5, 2),
        ROUND(COALESCE(permanent_offline_price, sale_price) * 1.3, 2),
        ROUND(COALESCE(permanent_online_price, sale_price) * 1.3, 2),
        platform, 
        ROUND(((original_price * 1.4 - sale_price * 1.3) / (original_price * 1.4)) * 100), -- Recalculate discount
        description, type, category, show_in_bestsellers,
        ARRAY['Season Pass', 'Exclusive Content', 'Digital Soundtrack', 'Art Book', 'Early Access']
      FROM games 
      WHERE id = game_record.id;
    END IF;
  END LOOP;
END $$;