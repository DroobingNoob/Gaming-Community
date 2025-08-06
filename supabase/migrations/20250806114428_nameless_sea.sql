/*
  # Add is_recommended column to games table

  1. Changes
    - Add `is_recommended` boolean column to games table with default false
    - Add index for efficient filtering of recommended games

  2. Security
    - Column is added to existing table with proper RLS policies already in place
*/

-- Add is_recommended column to games table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'is_recommended'
  ) THEN
    ALTER TABLE games ADD COLUMN is_recommended boolean DEFAULT false;
  END IF;
END $$;

-- Add index for filtering recommended games efficiently
CREATE INDEX IF NOT EXISTS idx_games_is_recommended 
ON games (is_recommended) 
WHERE (is_recommended = true);

-- Add comment to the index
COMMENT ON INDEX idx_games_is_recommended IS 'Index for filtering recommended games efficiently';