import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Game {
  id?: string;
  title: string;
  image: string;
  original_price: number;
  sale_price: number;
  rent_price?: number;
  platform: string[];
  discount: number;
  description: string;
  features: string[];
  system_requirements: string[];
  type: string[];
  category: 'game' | 'subscription';
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id?: string;
  name: string;
  time: string;
  message: string;
  reply: string;
  avatar: string;
  created_at?: string;
  updated_at?: string;
}