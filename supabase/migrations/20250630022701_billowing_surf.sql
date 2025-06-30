/*
  # Fix RLS policies for existing tables

  1. Security
    - Drop existing policies if they exist
    - Create new RLS policies for games and testimonials tables
    - Remove references to non-existent subscriptions table
    
  2. Tables affected
    - `games` table (stores both games and subscriptions via category column)
    - `testimonials` table
*/

-- Drop existing policies if they exist for games table
DROP POLICY IF EXISTS "Enable read access for all users" ON games;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON games;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON games;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON games;
DROP POLICY IF EXISTS "Allow public read access on games" ON games;
DROP POLICY IF EXISTS "Allow authenticated insert on games" ON games;
DROP POLICY IF EXISTS "Allow authenticated update on games" ON games;
DROP POLICY IF EXISTS "Allow authenticated delete on games" ON games;

-- Drop existing policies if they exist for testimonials table
DROP POLICY IF EXISTS "Enable read access for all users" ON testimonials;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON testimonials;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON testimonials;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON testimonials;
DROP POLICY IF EXISTS "Allow public read access on testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow authenticated insert on testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow authenticated update on testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow authenticated delete on testimonials" ON testimonials;

-- Games table policies (handles both games and subscriptions via category column)
CREATE POLICY "Enable read access for all users" ON games
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON games
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON games
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON games
  FOR DELETE USING (auth.role() = 'authenticated');

-- Testimonials table policies
CREATE POLICY "Enable read access for all users" ON testimonials
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON testimonials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON testimonials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON testimonials
  FOR DELETE USING (auth.role() = 'authenticated');