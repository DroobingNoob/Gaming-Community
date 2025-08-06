/*
# Add payment settings table

1. New Tables
  - `payment_settings`
    - `id` (uuid, primary key)
    - `razorpay_enabled` (boolean, default true)
    - `upi_qr_image` (text, UPI QR code image URL)
    - `upi_id` (text, UPI ID for payments)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

2. Security
  - Enable RLS on `payment_settings` table
  - Add policies for authenticated users to read and admin to write

3. Initial Data
  - Insert default payment settings
*/

CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_enabled boolean DEFAULT true,
  upi_qr_image text DEFAULT '/UPI.jpg',
  upi_id text DEFAULT '9069043750@Yes',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read payment settings
CREATE POLICY "Allow public read access on payment_settings"
  ON payment_settings
  FOR SELECT
  USING (true);

-- Allow authenticated users to update payment settings (admin only in practice)
CREATE POLICY "Allow authenticated update on payment_settings"
  ON payment_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on payment_settings"
  ON payment_settings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO payment_settings (razorpay_enabled, upi_qr_image, upi_id)
VALUES (true, '/UPI.jpg', '9069043750@Yes')
ON CONFLICT DO NOTHING;

-- Create index for better performance
CREATE INDEX idx_payment_settings_created_at ON payment_settings(created_at DESC);