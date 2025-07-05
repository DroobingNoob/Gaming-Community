/*
  # Create Gaming Community Database Schema

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `image` (text, not null)
      - `original_price` (decimal)
      - `sale_price` (decimal)
      - `rent_price` (decimal, optional)
      - `platform` (text array)
      - `discount` (integer, default 0)
      - `description` (text)
      - `features` (text array)
      - `system_requirements` (text array)
      - `type` (text array)
      - `category` (text, check constraint)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `testimonials`
      - `id` (uuid, primary key)
      - `image` (text, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated write access (admin)

  3. Performance
    - Add indexes for better query performance
*/

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  rent_price DECIMAL(10,2),
  platform TEXT[] NOT NULL,
  discount INTEGER DEFAULT 0,
  description TEXT,
  features TEXT[],
  system_requirements TEXT[],
  type TEXT[] NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('game', 'subscription')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create testimonials table (simplified for phone screenshots)
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on games" ON games
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on testimonials" ON testimonials
  FOR SELECT USING (true);

-- Create policies for authenticated write access (for admin)
CREATE POLICY "Allow authenticated insert on games" ON games
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on games" ON games
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on games" ON games
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on testimonials" ON testimonials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on testimonials" ON testimonials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on testimonials" ON testimonials
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);

-- Insert sample games
INSERT INTO games (title, image, original_price, sale_price, platform, discount, description, features, system_requirements, type, category) VALUES
('Grand Theft Auto V Premium Edition', 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 59.99, 19.99, ARRAY['PS5'], 67, 'Experience the award-winning Grand Theft Auto V with enhanced graphics and performance on PlayStation 5.', ARRAY['Enhanced graphics', 'Complete story', 'Online multiplayer'], ARRAY['PlayStation 5 console required', '50 GB storage'], ARRAY['Permanent'], 'game'),
('Xbox Game Pass Ultimate (3 Months)', 'https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 44.99, 29.99, ARRAY['Xbox'], 33, 'Get unlimited access to hundreds of high-quality games with Xbox Game Pass Ultimate.', ARRAY['Access to 100+ games', 'Day-one releases included', 'Xbox Live Gold membership'], ARRAY['Xbox console or Windows PC', 'Internet connection required'], ARRAY['Permanent'], 'subscription')
ON CONFLICT (id) DO NOTHING;

-- Insert sample testimonials (phone screenshots)
INSERT INTO testimonials (image) VALUES
('https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=600'),
('https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=600')
ON CONFLICT (id) DO NOTHING;