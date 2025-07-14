import { supabase, Game, Testimonial } from '../config/supabase';
import type { PaymentSettings } from '../config/supabase';

// Games Service
export const gamesService = {
  // Get all games
  async getAll(): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('category', 'game')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  },

  // Get bestseller games (only those marked as bestsellers)
  async getBestsellers(limitCount: number = 6): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('category', 'game')
        .eq('show_in_bestsellers', true)
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      return [];
    }
  },

  // Add new game
  async add(game: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      // Insert without authentication check - let RLS handle it
      const { data, error } = await supabase
        .from('games')
        .insert([{
          ...game,
          category: 'game'
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data.id;
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  },

  // Update game
  async update(id: string, game: Partial<Game>): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          ...game,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  },

  // Delete game
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }
};

// Subscriptions Service
export const subscriptionsService = {
  // Get all subscriptions
  async getAll(): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('category', 'subscription')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  },

  // Add new subscription
  async add(subscription: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([{
          ...subscription,
          category: 'subscription'
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data.id;
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  },

  // Update subscription
  async update(id: string, subscription: Partial<Game>): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          ...subscription,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Delete subscription
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }
};

// Testimonials Service
export const testimonialsService = {
  // Get all testimonials
  async getAll(): Promise<Testimonial[]> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  },

  // Add new testimonial
  async add(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([testimonial])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data.id;
    } catch (error) {
      console.error('Error adding testimonial:', error);
      throw error;
    }
  },

  // Update testimonial
  async update(id: string, testimonial: Partial<Testimonial>): Promise<void> {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          ...testimonial,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  },

  // Delete testimonial
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }
};

// Payment Settings Service
export const paymentSettingsService = {
  // Get payment settings
  async get(): Promise<PaymentSettings | null> {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching payment settings:', error);
        // Return default settings if none exist
        return {
          razorpay_enabled: true,
          upi_qr_image: '/UPI.jpg',
          upi_id: 'gamingcommunity@paytm'
        };
      }
      return data;
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      return {
        razorpay_enabled: true,
        upi_qr_image: '/UPI.jpg',
        upi_id: 'gamingcommunity@paytm'
      };
    }
  },

  // Update payment settings
  async update(settings: Partial<PaymentSettings>): Promise<void> {
    try {
      // First try to update existing settings
      const { data: existingData } = await supabase
        .from('payment_settings')
        .select('id')
        .limit(1)
        .single();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('payment_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);

        if (error) {
          console.error('Supabase error updating payment settings:', error);
          throw error;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('payment_settings')
          .insert([{
            razorpay_enabled: true,
            upi_qr_image: '/UPI.jpg',
            upi_id: 'gamingcommunity@paytm',
            ...settings
          }]);

        if (error) {
          console.error('Supabase error inserting payment settings:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      throw error;
    }
  }
};