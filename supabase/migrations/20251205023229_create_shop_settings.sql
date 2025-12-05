/*
  # Create Shop Settings Table

  1. New Tables
    - `shop_settings`
      - `id` (uuid, primary key)
      - `shop_mode` (text) - Values: 'working_hours' | 'close_now' | 'force_open'
      - `working_hours_start` (text) - Default: '10:00'
      - `working_hours_end` (text) - Default: '22:00'
      - `closed_message` (text) - Custom message shown when shop is closed
      - `updated_at` (timestamp)
      - `updated_by` (text) - Email of admin who last updated
  
  2. Security
    - Enable RLS on `shop_settings` table
    - Add policy for anyone to read settings (needed for shop status)
    - Add policy for authenticated admins to update settings
  
  3. Initial Data
    - Insert default setting with 'working_hours' mode
*/

-- Create shop_settings table
CREATE TABLE IF NOT EXISTS shop_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_mode text NOT NULL DEFAULT 'working_hours' CHECK (shop_mode IN ('working_hours', 'close_now', 'force_open')),
  working_hours_start text NOT NULL DEFAULT '10:00',
  working_hours_end text NOT NULL DEFAULT '22:00',
  closed_message text DEFAULT 'The shop is currently closed. Please try again during our working hours (10:00 AM - 10:00 PM).',
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

-- Enable RLS
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shop settings (needed for checking if shop is open)
CREATE POLICY "Anyone can read shop settings"
  ON shop_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to update shop settings
-- Note: Application should check if user is admin before calling update
CREATE POLICY "Authenticated users can update shop settings"
  ON shop_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings (only if no settings exist)
INSERT INTO shop_settings (shop_mode, working_hours_start, working_hours_end, closed_message)
SELECT 'working_hours', '10:00', '22:00', 'The shop is currently closed. Please try again during our working hours (10:00 AM - 10:00 PM).'
WHERE NOT EXISTS (SELECT 1 FROM shop_settings LIMIT 1);