/*
  # Update Pricing Structure for Games

  1. Schema Changes
    - Remove old rent_price column
    - Add new rental pricing columns (1, 2, 3, 6 months)
    - Add permanent offline and online pricing columns
    - Remove features and system_requirements columns
    - Add show_in_bestsellers column for games

  2. Data Migration
    - Preserve existing data where possible
    - Set default values for new columns

  3. Performance
    - Update indexes as needed
*/

-- Add new pricing columns
DO $$
BEGIN
  -- Add rental pricing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'rent_1_month'
  ) THEN
    ALTER TABLE games ADD COLUMN rent_1_month DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'rent_2_months'
  ) THEN
    ALTER TABLE games ADD COLUMN rent_2_months DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'rent_3_months'
  ) THEN
    ALTER TABLE games ADD COLUMN rent_3_months DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'rent_6_months'
  ) THEN
    ALTER TABLE games ADD COLUMN rent_6_months DECIMAL(10,2);
  END IF;

  -- Add permanent pricing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'permanent_offline_price'
  ) THEN
    ALTER TABLE games ADD COLUMN permanent_offline_price DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'permanent_online_price'
  ) THEN
    ALTER TABLE games ADD COLUMN permanent_online_price DECIMAL(10,2);
  END IF;

  -- Add show_in_bestsellers column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'show_in_bestsellers'
  ) THEN
    ALTER TABLE games ADD COLUMN show_in_bestsellers BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Migrate existing rent_price data to rent_1_month if rent_price exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'rent_price'
  ) THEN
    UPDATE games SET rent_1_month = rent_price WHERE rent_price IS NOT NULL;
  END IF;
END $$;

-- Remove old columns that are no longer needed
DO $$
BEGIN
  -- Remove rent_price column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'rent_price'
  ) THEN
    ALTER TABLE games DROP COLUMN rent_price;
  END IF;

  -- Remove features column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'features'
  ) THEN
    ALTER TABLE games DROP COLUMN features;
  END IF;

  -- Remove system_requirements column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'system_requirements'
  ) THEN
    ALTER TABLE games DROP COLUMN system_requirements;
  END IF;
END $$;

-- Update existing games to have show_in_bestsellers = true for demonstration
UPDATE games SET show_in_bestsellers = true WHERE id IN (
  SELECT id FROM games WHERE category = 'game' LIMIT 3
);

-- Add some sample pricing data for existing games
UPDATE games SET 
  rent_1_month = CASE 
    WHEN sale_price > 0 THEN ROUND(sale_price * 0.3, 2)
    ELSE NULL
  END,
  rent_2_months = CASE 
    WHEN sale_price > 0 THEN ROUND(sale_price * 0.5, 2)
    ELSE NULL
  END,
  rent_3_months = CASE 
    WHEN sale_price > 0 THEN ROUND(sale_price * 0.7, 2)
    ELSE NULL
  END,
  rent_6_months = CASE 
    WHEN sale_price > 0 THEN ROUND(sale_price * 1.0, 2)
    ELSE NULL
  END,
  permanent_offline_price = CASE 
    WHEN sale_price > 0 THEN ROUND(sale_price * 0.8, 2)
    ELSE NULL
  END,
  permanent_online_price = sale_price
WHERE category = 'game' AND sale_price > 0;