/*
  # Update games table structure for enhanced pricing and features

  1. New Columns Added
    - `rent_1_month`, `rent_2_months`, `rent_3_months`, `rent_6_months` for rental pricing
    - `permanent_offline_price`, `permanent_online_price` for permanent purchase options
    - `show_in_bestsellers` for homepage bestseller display
  
  2. Data Type Updates
    - Ensure `platform` and `type` columns are arrays
    - Add proper constraints for category validation
  
  3. Security Updates
    - Refresh RLS policies with correct authentication checks
    - Add optimized indexes for better performance
  
  4. Sample Data
    - Add sample games and subscriptions if tables are empty
    - Include proper pricing structure for all game types
*/

-- First, let's safely add missing columns to games table if they don't exist
DO $$ 
BEGIN
  -- Add rent pricing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'rent_1_month') THEN
    ALTER TABLE games ADD COLUMN rent_1_month DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'rent_2_months') THEN
    ALTER TABLE games ADD COLUMN rent_2_months DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'rent_3_months') THEN
    ALTER TABLE games ADD COLUMN rent_3_months DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'rent_6_months') THEN
    ALTER TABLE games ADD COLUMN rent_6_months DECIMAL(10,2);
  END IF;
  
  -- Add permanent pricing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'permanent_offline_price') THEN
    ALTER TABLE games ADD COLUMN permanent_offline_price DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'permanent_online_price') THEN
    ALTER TABLE games ADD COLUMN permanent_online_price DECIMAL(10,2);
  END IF;
  
  -- Add bestseller column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'show_in_bestsellers') THEN
    ALTER TABLE games ADD COLUMN show_in_bestsellers BOOLEAN DEFAULT false;
  END IF;
  
  -- Ensure platform column is array type (only if it exists and isn't already an array)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' 
    AND column_name = 'platform' 
    AND data_type != 'ARRAY'
    AND udt_name != '_text'
  ) THEN
    -- Convert platform to array if it's not already
    ALTER TABLE games ALTER COLUMN platform TYPE TEXT[] USING 
      CASE 
        WHEN platform IS NULL THEN ARRAY[]::TEXT[]
        WHEN platform = '' THEN ARRAY[]::TEXT[]
        ELSE ARRAY[platform]
      END;
  END IF;
  
  -- Ensure type column is array type (only if it exists and isn't already an array)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' 
    AND column_name = 'type' 
    AND data_type != 'ARRAY'
    AND udt_name != '_text'
  ) THEN
    -- Convert type to array if it's not already
    ALTER TABLE games ALTER COLUMN type TYPE TEXT[] USING 
      CASE 
        WHEN type IS NULL THEN ARRAY[]::TEXT[]
        WHEN type = '' THEN ARRAY[]::TEXT[]
        ELSE ARRAY[type]
      END;
  END IF;
  
  -- Add category constraint if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'games_category_check') THEN
    ALTER TABLE games ADD CONSTRAINT games_category_check CHECK (category IN ('game', 'subscription'));
  END IF;
END $$;

-- Ensure RLS is enabled on both tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Drop and recreate games policies
  DROP POLICY IF EXISTS "Allow public read access on games" ON games;
  DROP POLICY IF EXISTS "Allow authenticated insert on games" ON games;
  DROP POLICY IF EXISTS "Allow authenticated update on games" ON games;
  DROP POLICY IF EXISTS "Allow authenticated delete on games" ON games;
  
  -- Drop and recreate testimonials policies
  DROP POLICY IF EXISTS "Allow public read access on testimonials" ON testimonials;
  DROP POLICY IF EXISTS "Allow authenticated insert on testimonials" ON testimonials;
  DROP POLICY IF EXISTS "Allow authenticated update on testimonials" ON testimonials;
  DROP POLICY IF EXISTS "Allow authenticated delete on testimonials" ON testimonials;
END $$;

-- Create new policies for games
CREATE POLICY "Allow public read access on games" ON games
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on games" ON games
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update on games" ON games
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete on games" ON games
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create new policies for testimonials
CREATE POLICY "Allow public read access on testimonials" ON testimonials
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on testimonials" ON testimonials
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update on testimonials" ON testimonials
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete on testimonials" ON testimonials
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_show_in_bestsellers ON games(show_in_bestsellers) WHERE show_in_bestsellers = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);

-- Insert sample data only if tables are empty or have very few records
DO $$
BEGIN
  -- Add sample games if games table has fewer than 3 records
  IF (SELECT COUNT(*) FROM games) < 3 THEN
    INSERT INTO games (title, image, original_price, sale_price, platform, discount, description, type, category, rent_1_month, rent_2_months, rent_3_months, rent_6_months, permanent_offline_price, permanent_online_price, show_in_bestsellers) VALUES
    ('Grand Theft Auto V Premium Edition', 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 2999.00, 299.00, ARRAY['PS5'], 90, 'Experience the award-winning Grand Theft Auto V with enhanced graphics and performance on PlayStation 5.', ARRAY['Rent', 'Permanent Offline', 'Permanent Offline + Online'], 'game', 299.00, 549.00, 799.00, 1499.00, 1999.00, 2499.00, true),
    ('Call of Duty: Modern Warfare III', 'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 4999.00, 399.00, ARRAY['PS5', 'PS4'], 92, 'The latest Call of Duty experience with cutting-edge multiplayer and campaign modes.', ARRAY['Rent', 'Permanent Offline + Online'], 'game', 399.00, 749.00, 1099.00, 1999.00, NULL, 2999.00, true),
    ('Spider-Man 2', 'https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 4999.00, 449.00, ARRAY['PS5'], 91, 'Swing through New York as both Peter Parker and Miles Morales in this epic superhero adventure.', ARRAY['Rent', 'Permanent Offline'], 'game', 449.00, 849.00, 1249.00, 2299.00, 2999.00, NULL, true),
    ('Xbox Game Pass Ultimate (3 Months)', 'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 1499.00, 999.00, ARRAY['Multi-Platform'], 33, 'Get unlimited access to hundreds of high-quality games with Xbox Game Pass Ultimate.', ARRAY['Permanent'], 'subscription', NULL, NULL, NULL, NULL, NULL, NULL, false),
    ('PlayStation Plus Extra (1 Month)', 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 749.00, 599.00, ARRAY['Multi-Platform'], 20, 'Access to a catalog of hundreds of PS4 and PS5 games, plus all PlayStation Plus Essential benefits.', ARRAY['Permanent'], 'subscription', NULL, NULL, NULL, NULL, NULL, NULL, false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Add sample testimonials if testimonials table has fewer than 2 records
  IF (SELECT COUNT(*) FROM testimonials) < 2 THEN
    INSERT INTO testimonials (image) VALUES
    ('https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=600'),
    ('https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=600'),
    ('https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=300&h=600')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;