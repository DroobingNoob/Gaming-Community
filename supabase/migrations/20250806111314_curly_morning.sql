/*
  # Add isRecommended field to games table

  1. Schema Changes
    - Add `is_recommended` boolean field to `games` table
    - Set default value to false
    - Add index for better performance on recommended games queries

  2. Data Migration
    - All existing games will have is_recommended = false by default
    - No data loss or modification of existing records
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

-- Add index for better performance when querying recommended games
CREATE INDEX IF NOT EXISTS idx_games_is_recommended 
ON games(is_recommended) 
WHERE is_recommended = true;

-- Update the existing index comment for clarity
COMMENT ON INDEX idx_games_is_recommended IS 'Index for filtering recommended games efficiently';