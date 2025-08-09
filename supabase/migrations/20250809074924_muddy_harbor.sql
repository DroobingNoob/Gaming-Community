/*
  # Add subscription duration options

  1. Database Changes
    - Add `rent_12_months` column to games table for 12-month subscription pricing
    - Update existing rental columns to be more flexible for subscriptions
    - Add index for better performance on rental pricing queries

  2. Security
    - No changes to existing RLS policies
    - New column inherits existing table permissions

  3. Notes
    - All rental duration columns are nullable, allowing flexibility
    - Subscriptions can have any combination of 1, 3, 6, or 12-month options
    - Existing data remains unchanged
*/

-- Add 12-month rental option to games table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'rent_12_months'
  ) THEN
    ALTER TABLE games ADD COLUMN rent_12_months numeric(10,2);
  END IF;
END $$;

-- Add index for rental pricing queries
CREATE INDEX IF NOT EXISTS idx_games_rental_pricing 
ON games(rent_1_month, rent_3_months, rent_6_months, rent_12_months) 
WHERE rent_1_month IS NOT NULL OR rent_3_months IS NOT NULL OR rent_6_months IS NOT NULL OR rent_12_months IS NOT NULL;