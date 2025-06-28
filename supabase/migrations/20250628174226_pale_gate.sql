/*
  # Remove 2 Month Rent Option

  1. Database Changes
    - Remove rent_2_months column from games table
    - Update any existing data that might reference 2 month rentals

  2. Notes
    - This migration safely removes the 2 month rent option
    - Existing data is preserved for other rental periods
*/

-- Remove the rent_2_months column from games table
DO $$ 
BEGIN
  -- Check if the column exists before trying to drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' 
    AND column_name = 'rent_2_months'
  ) THEN
    ALTER TABLE games DROP COLUMN rent_2_months;
  END IF;
END $$;