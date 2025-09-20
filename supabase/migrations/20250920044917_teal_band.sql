/*
  # Update Game Editions System

  1. Schema Changes
    - Update edition constraint to include Standard, Premium, Ultimate, Deluxe
    - Add index for better edition filtering performance
    - Update existing check constraint

  2. Data Integrity
    - Maintains existing data structure
    - Ensures proper edition validation
    - Optimizes queries for edition relationships

  3. Performance
    - Adds composite index for title + edition lookups
    - Improves base_game_id relationship queries
*/

-- Update the edition check constraint to include all four editions
DO $$
BEGIN
  -- Drop the existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'games' AND constraint_name = 'games_edition_check'
  ) THEN
    ALTER TABLE games DROP CONSTRAINT games_edition_check;
  END IF;
  
  -- Add the new constraint with all four editions
  ALTER TABLE games ADD CONSTRAINT games_edition_check 
    CHECK (edition = ANY (ARRAY['Standard'::text, 'Premium'::text, 'Ultimate'::text, 'Deluxe'::text]));
END $$;

-- Add index for better edition filtering performance if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'games' AND indexname = 'idx_games_edition_base_game'
  ) THEN
    CREATE INDEX idx_games_edition_base_game ON games(base_game_id, edition) 
    WHERE base_game_id IS NOT NULL;
  END IF;
END $$;

-- Add index for title-edition combinations if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'games' AND indexname = 'idx_games_title_edition_lookup'
  ) THEN
    CREATE INDEX idx_games_title_edition_lookup ON games(title, edition);
  END IF;
END $$;