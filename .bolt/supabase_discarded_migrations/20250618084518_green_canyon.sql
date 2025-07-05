/*
  # Update RLS Policies for Authentication

  1. Security Updates
    - Update RLS policies to work with authenticated users
    - Add policies for public read access where appropriate
    - Ensure admin operations work with proper authentication

  2. Policy Changes
    - Allow public read access to games and subscriptions for browsing
    - Require authentication for testimonials management
    - Restrict write operations to authenticated users only
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON games;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON games;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON games;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON games;

DROP POLICY IF EXISTS "Enable read access for all users" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON subscriptions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON subscriptions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON subscriptions;

DROP POLICY IF EXISTS "Enable read access for all users" ON testimonials;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON testimonials;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON testimonials;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON testimonials;

-- Games table policies
CREATE POLICY "Enable read access for all users" ON games
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON games
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON games
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON games
  FOR DELETE USING (auth.role() = 'authenticated');

-- Subscriptions table policies (assuming it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    EXECUTE 'CREATE POLICY "Enable read access for all users" ON subscriptions FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Enable insert for authenticated users only" ON subscriptions FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "Enable update for authenticated users only" ON subscriptions FOR UPDATE USING (auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "Enable delete for authenticated users only" ON subscriptions FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- Testimonials table policies
CREATE POLICY "Enable read access for all users" ON testimonials
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON testimonials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON testimonials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON testimonials
  FOR DELETE USING (auth.role() = 'authenticated');