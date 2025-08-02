/*
  # Add recommendation field to games table

  1. Schema Changes
    - Add `is_recommended` boolean field to games table with default false
    - Add index for better query performance on recommended games

  2. Security
    - No changes to RLS policies needed as this uses existing game table policies
*/

-- Add is_recommended field to games table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'is_recommended'
  ) THEN
    ALTER TABLE games ADD COLUMN is_recommended boolean DEFAULT false;
  END IF;
END $$;

-- Add index for better performance when querying recommended games
CREATE INDEX IF NOT EXISTS idx_games_is_recommended 
ON games(is_recommended) 
WHERE is_recommended = true;

-- Update existing games to have is_recommended = false (already default, but explicit)
UPDATE games SET is_recommended = false WHERE is_recommended IS NULL;