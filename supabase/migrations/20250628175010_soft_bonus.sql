/*
  # Fix subscriptions table issue

  1. Changes
    - Ensure all subscription-related queries use the games table with category filter
    - Add missing indexes for better performance
    - Update any existing data to ensure proper categorization
*/

-- Ensure the games table has the category column and proper constraints
DO $$ 
BEGIN
  -- Make sure category column exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'category') THEN
    ALTER TABLE games ADD COLUMN category TEXT NOT NULL DEFAULT 'game';
  END IF;

  -- Ensure category constraint exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'games_category_check') THEN
    ALTER TABLE games ADD CONSTRAINT games_category_check CHECK (category IN ('game', 'subscription'));
  END IF;
END $$;

-- Create index on category if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);

-- Update any existing subscription data to ensure proper categorization
UPDATE games 
SET category = 'subscription' 
WHERE title LIKE '%Game Pass%' OR title LIKE '%PlayStation Plus%' OR title LIKE '%PS Plus%' OR title LIKE '%Subscription%'
AND category != 'subscription';

-- Ensure RLS policies allow access to both games and subscriptions
DO $$ 
BEGIN
  -- Recreate policies to ensure they work for both categories
  DROP POLICY IF EXISTS "Allow public read access on games" ON games;
  CREATE POLICY "Allow public read access on games" ON games
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Allow authenticated insert on games" ON games;
  CREATE POLICY "Allow authenticated insert on games" ON games
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

  DROP POLICY IF EXISTS "Allow authenticated update on games" ON games;
  CREATE POLICY "Allow authenticated update on games" ON games
    FOR UPDATE USING (auth.uid() IS NOT NULL);

  DROP POLICY IF EXISTS "Allow authenticated delete on games" ON games;
  CREATE POLICY "Allow authenticated delete on games" ON games
    FOR DELETE USING (auth.uid() IS NOT NULL);
END $$;

-- Add sample subscription data if needed
DO $$
BEGIN
  -- Only add sample data if there are no subscriptions
  IF NOT EXISTS (SELECT 1 FROM games WHERE category = 'subscription' LIMIT 1) THEN
    INSERT INTO games (
      title, 
      image, 
      original_price, 
      sale_price, 
      platform, 
      discount, 
      description, 
      type, 
      category
    ) VALUES
    (
      'Xbox Game Pass Ultimate (3 Months)', 
      'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 
      1499.00, 
      999.00, 
      ARRAY['Multi-Platform'], 
      33, 
      'Get unlimited access to hundreds of high-quality games with Xbox Game Pass Ultimate.', 
      ARRAY['Permanent'], 
      'subscription'
    ),
    (
      'PlayStation Plus Extra (1 Month)', 
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 
      749.00, 
      599.00, 
      ARRAY['Multi-Platform'], 
      20, 
      'Access to a catalog of hundreds of PS4 and PS5 games, plus all PlayStation Plus Essential benefits.', 
      ARRAY['Permanent'], 
      'subscription'
    ),
    (
      'PlayStation Plus Deluxe (12 Months)', 
      'https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 
      3999.00, 
      2999.00, 
      ARRAY['Multi-Platform'], 
      25, 
      'The ultimate PlayStation subscription with game catalog, classics catalog, game trials, and online multiplayer.', 
      ARRAY['Permanent'], 
      'subscription'
    );
  END IF;
END $$;