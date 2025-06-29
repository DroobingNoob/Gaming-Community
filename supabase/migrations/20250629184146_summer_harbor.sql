/*
  # Fix Games Table Schema

  1. Schema Updates
    - Add missing columns for rental pricing
    - Add permanent pricing columns
    - Add show_in_bestsellers column
    - Update existing data structure

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access controls
*/

-- Add missing columns to games table if they don't exist
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

-- Create index for bestsellers if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_games_show_in_bestsellers 
ON games(show_in_bestsellers) 
WHERE show_in_bestsellers = true;

-- Update any existing games to have proper default values
UPDATE games 
SET show_in_bestsellers = false 
WHERE show_in_bestsellers IS NULL;

-- Insert some sample data if tables are empty
DO $$
BEGIN
  -- Check if we have any games
  IF NOT EXISTS (SELECT 1 FROM games WHERE category = 'game' LIMIT 1) THEN
    -- Insert sample games
    INSERT INTO games (
      title, image, original_price, sale_price, 
      rent_1_month, rent_3_months, rent_6_months,
      permanent_offline_price, permanent_online_price,
      platform, discount, description, type, category, show_in_bestsellers
    ) VALUES
    (
      'Spider-Man: Miles Morales', 
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
      4999.00, 2999.00,
      299.00, 799.00, 1499.00,
      2999.00, 3499.00,
      ARRAY['PS5'], 40,
      'Experience the rise of Miles Morales as the new hero masters incredible, explosive new powers.',
      ARRAY['Rent', 'Permanent Offline', 'Permanent Offline + Online'], 'game', true
    ),
    (
      'God of War Ragnarök', 
      'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
      5999.00, 3999.00,
      399.00, 999.00, 1899.00,
      3999.00, 4499.00,
      ARRAY['PS5'], 33,
      'Kratos and Atreus embark on a mythic journey for answers before Ragnarök arrives.',
      ARRAY['Rent', 'Permanent Offline', 'Permanent Offline + Online'], 'game', true
    ),
    (
      'Horizon Forbidden West', 
      'https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
      4999.00, 2499.00,
      249.00, 699.00, 1299.00,
      2499.00, 2999.00,
      ARRAY['PS5'], 50,
      'Join Aloy as she braves the Forbidden West - a majestic but dangerous frontier.',
      ARRAY['Rent', 'Permanent Offline', 'Permanent Offline + Online'], 'game', true
    );
  END IF;

  -- Check if we have any subscriptions
  IF NOT EXISTS (SELECT 1 FROM games WHERE category = 'subscription' LIMIT 1) THEN
    -- Insert sample subscriptions
    INSERT INTO games (
      title, image, original_price, sale_price,
      platform, discount, description, type, category
    ) VALUES
    (
      'PlayStation Plus Extra (3 Months)', 
      'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
      2997.00, 2397.00,
      ARRAY['Multi-Platform'], 20,
      'Access to a catalog of up to 400 PS4 and PS5 games, including blockbuster hits.',
      ARRAY['Permanent'], 'subscription'
    ),
    (
      'PlayStation Plus Deluxe (1 Month)', 
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
      1299.00, 999.00,
      ARRAY['Multi-Platform'], 23,
      'Everything in Extra, plus classic games from PS1, PS2, PS3, and PSP.',
      ARRAY['Permanent'], 'subscription'
    );
  END IF;

  -- Check if we have any testimonials
  IF NOT EXISTS (SELECT 1 FROM testimonials LIMIT 1) THEN
    -- Insert sample testimonials
    INSERT INTO testimonials (image) VALUES
    ('https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=600'),
    ('https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=600'),
    ('https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=300&h=600');
  END IF;
END $$;