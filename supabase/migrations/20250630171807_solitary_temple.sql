/*
  # Add Deluxe Edition Support

  1. Database Changes
    - Update edition constraint to include 'Deluxe' option
    - Maintain existing Standard and Premium editions
    
  2. Security
    - No changes to RLS policies needed
    - Existing policies will cover the new edition type
*/

-- Update the edition constraint to include Deluxe
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_edition_check;

-- Add new constraint with Deluxe edition
ALTER TABLE games ADD CONSTRAINT games_edition_check 
  CHECK (edition = ANY (ARRAY['Standard'::text, 'Premium'::text, 'Deluxe'::text]));

-- Update default value to ensure it's still Standard
ALTER TABLE games ALTER COLUMN edition SET DEFAULT 'Standard'::text;