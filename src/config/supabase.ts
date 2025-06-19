import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbjymmzgysjzhmmkafaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianltbXpneXNqemhtbWthZmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMTMyNzMsImV4cCI6MjA2NTc4OTI3M30.xblro8Quvlg1N9qSz1FcCnQ1ptJgzrV2BlJBHGHvhTg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Game {
  id?: string;
  title: string;
  image: string;
  original_price: number;
  sale_price: number;
  // Rental pricing
  rent_1_month?: number;
  rent_2_months?: number;
  rent_3_months?: number;
  rent_6_months?: number;
  // Permanent pricing
  permanent_offline_price?: number;
  permanent_online_price?: number;
  platform: string[];
  discount: number;
  description: string;
  type: string[];
  category: 'game' | 'subscription';
  show_in_bestsellers?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id?: string;
  image: string; // Phone screenshot URL
  created_at?: string;
  updated_at?: string;
}