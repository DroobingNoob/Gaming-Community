import { supabase } from '../config/supabase';

export type ShopMode = 'working_hours' | 'close_now' | 'force_open';

export interface ShopSettings {
  id: string;
  shop_mode: ShopMode;
  working_hours_start: string;
  working_hours_end: string;
  closed_message: string;
  updated_at: string;
  updated_by?: string;
}

export interface ShopStatus {
  isOpen: boolean;
  mode: ShopMode;
  message: string;
  workingHours?: {
    start: string;
    end: string;
  };
}

export const settingsService = {
  async getShopSettings(): Promise<ShopSettings | null> {
    try {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching shop settings:', error);
      return null;
    }
  },

  async updateShopSettings(
    updates: Partial<ShopSettings>,
    adminEmail: string
  ): Promise<boolean> {
    try {
      const settings = await this.getShopSettings();
      if (!settings) throw new Error('Shop settings not found');

      const { error } = await supabase
        .from('shop_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: adminEmail
        })
        .eq('id', settings.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating shop settings:', error);
      return false;
    }
  },

  isWithinWorkingHours(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = endTime.split(':').map(Number);
    const endTimeInMinutes = endHour * 60 + endMinute;

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
  },

  async getShopStatus(): Promise<ShopStatus> {
    try {
      const settings = await this.getShopSettings();

      if (!settings) {
        return {
          isOpen: true,
          mode: 'force_open',
          message: 'Shop is open'
        };
      }

      const { shop_mode, working_hours_start, working_hours_end, closed_message } = settings;

      switch (shop_mode) {
        case 'force_open':
          return {
            isOpen: true,
            mode: shop_mode,
            message: 'Shop is open 24/7'
          };

        case 'close_now':
          return {
            isOpen: false,
            mode: shop_mode,
            message: closed_message
          };

        case 'working_hours':
          const isWithinHours = this.isWithinWorkingHours(
            working_hours_start,
            working_hours_end
          );
          return {
            isOpen: isWithinHours,
            mode: shop_mode,
            message: isWithinHours
              ? 'Shop is open'
              : closed_message,
            workingHours: {
              start: working_hours_start,
              end: working_hours_end
            }
          };

        default:
          return {
            isOpen: true,
            mode: 'force_open',
            message: 'Shop is open'
          };
      }
    } catch (error) {
      console.error('Error getting shop status:', error);
      return {
        isOpen: true,
        mode: 'force_open',
        message: 'Shop is open'
      };
    }
  },

  subscribeToSettings(callback: (settings: ShopSettings) => void) {
    const subscription = supabase
      .channel('shop_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shop_settings'
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as ShopSettings);
          }
        }
      )
      .subscribe();

    return subscription;
  }
};
