/*
  # Add recommended games feature

  1. Changes
    - Add `is_recommended` column to games table for featured games section
    - Add performance index for filtering recommended games efficiently
    - Update existing games to have default `is_recommended` value

  2. Security
    - Maintains existing RLS policies
    - No changes to authentication or permissions
*/

-- Add is_recommended column for featured games
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'is_recommended'
  ) THEN
    ALTER TABLE games ADD COLUMN is_recommended boolean DEFAULT false;
  END IF;
END $$;

-- Add index for efficient filtering of recommended games
CREATE INDEX IF NOT EXISTS idx_games_is_recommended 
ON games (is_recommended) 
WHERE is_recommended = true;