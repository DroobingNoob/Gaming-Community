-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON games;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON games;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON games;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON games;

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

-- Testimonials table policies
CREATE POLICY "Enable read access for all users" ON testimonials
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON testimonials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON testimonials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON testimonials
  FOR DELETE USING (auth.role() = 'authenticated');