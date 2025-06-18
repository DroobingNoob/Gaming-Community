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