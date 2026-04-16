import { supabase } from "../config/supabase";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export type ShopMode = "working_hours" | "close_now" | "force_open";

export interface ShopSettings {
  id: string;
  shop_mode: ShopMode;
  working_hours_start: string;
  working_hours_end: string;
  closed_message: string;
  updated_at: string;
  updated_by?: string;
}

export interface PaymentSettings {
  id: string;
  razorpay_enabled: boolean;
  upi_qr_image: string;
  upi_id: string;
  created_at?: string;
  updated_at?: string;
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

function normalizeShopSettings(raw: any): ShopSettings | null {
  if (!raw) return null;

  return {
    id: raw.id,
    shop_mode: raw.shop_mode as ShopMode,
    working_hours_start: raw.working_hours_start || "09:00",
    working_hours_end: raw.working_hours_end || "21:00",
    closed_message: raw.closed_message || "Shop is currently closed",
    updated_at: raw.updated_at || new Date().toISOString(),
    updated_by: raw.updated_by || undefined,
  };
}

function normalizePaymentSettings(raw: any): PaymentSettings | null {
  if (!raw) return null;

  return {
    id: raw.id,
    razorpay_enabled: Boolean(raw.razorpay_enabled),
    upi_qr_image: raw.upi_qr_image || "",
    upi_id: raw.upi_id || "",
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export const settingsService = {
  async getShopSettings(): Promise<ShopSettings | null> {
    try {
      const response = await fetch(`${API_URL}/shop-settings`);

      if (!response.ok) {
        throw new Error(`Failed to fetch shop settings: ${response.status}`);
      }

      const data = await response.json();
      return normalizeShopSettings(data);
    } catch (error) {
      console.error("Error fetching shop settings:", error);
      return null;
    }
  },

  async updateShopSettings(
    updates: Partial<ShopSettings>,
    adminEmail: string
  ): Promise<boolean> {
    try {
      const current = await this.getShopSettings();

      const payload = {
        shop_mode: updates.shop_mode || current?.shop_mode || "force_open",
        working_hours_start:
          updates.working_hours_start || current?.working_hours_start || "09:00",
        working_hours_end:
          updates.working_hours_end || current?.working_hours_end || "21:00",
        closed_message:
          updates.closed_message ||
          current?.closed_message ||
          "Shop is currently closed",
        updated_by: adminEmail,
      };

      const response = await fetch(`${API_URL}/shop-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update shop settings: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error updating shop settings:", error);
      return false;
    }
  },

  async getPaymentSettings(): Promise<PaymentSettings | null> {
    try {
      const response = await fetch(`${API_URL}/payment-settings`);

      if (!response.ok) {
        throw new Error(`Failed to fetch payment settings: ${response.status}`);
      }

      const data = await response.json();
      return normalizePaymentSettings(data);
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      return null;
    }
  },

  async updatePaymentSettings(
    updates: Partial<PaymentSettings>
  ): Promise<boolean> {
    try {
      const current = await this.getPaymentSettings();

      const payload = {
        razorpay_enabled:
          updates.razorpay_enabled ?? current?.razorpay_enabled ?? false,
        upi_qr_image: updates.upi_qr_image ?? current?.upi_qr_image ?? "",
        upi_id: updates.upi_id ?? current?.upi_id ?? "",
      };

      const response = await fetch(`${API_URL}/payment-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update payment settings: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error updating payment settings:", error);
      return false;
    }
  },

  async uploadPaymentQrImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("qrImage", file);

    const response = await fetch(`${API_URL}/payment-settings/upload-qr`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload QR image: ${response.status}`);
    }

    const data = await response.json();
    return data.filePath || null;
  } catch (error) {
    console.error("Error uploading payment QR image:", error);
    return null;
  }
},

  isWithinWorkingHours(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = endTime.split(":").map(Number);
    const endTimeInMinutes = endHour * 60 + endMinute;

    return (
      currentTimeInMinutes >= startTimeInMinutes &&
      currentTimeInMinutes < endTimeInMinutes
    );
  },

  async getShopStatus(): Promise<ShopStatus> {
    try {
      const settings = await this.getShopSettings();

      if (!settings) {
        return {
          isOpen: true,
          mode: "force_open",
          message: "Shop is open",
        };
      }

      const {
        shop_mode,
        working_hours_start,
        working_hours_end,
        closed_message,
      } = settings;

      switch (shop_mode) {
        case "force_open":
          return {
            isOpen: true,
            mode: shop_mode,
            message: "Shop is open 24/7",
          };

        case "close_now":
          return {
            isOpen: false,
            mode: shop_mode,
            message: closed_message,
          };

        case "working_hours": {
          const isWithinHours = this.isWithinWorkingHours(
            working_hours_start,
            working_hours_end
          );

          return {
            isOpen: isWithinHours,
            mode: shop_mode,
            message: isWithinHours ? "Shop is open" : closed_message,
            workingHours: {
              start: working_hours_start,
              end: working_hours_end,
            },
          };
        }

        default:
          return {
            isOpen: true,
            mode: "force_open",
            message: "Shop is open",
          };
      }
    } catch (error) {
      console.error("Error getting shop status:", error);
      return {
        isOpen: true,
        mode: "force_open",
        message: "Shop is open",
      };
    }
  },

  subscribeToSettings(callback: (settings: ShopSettings) => void) {
    console.warn(
      "Realtime shop settings subscription is disabled during migration."
    );

    const interval = window.setInterval(async () => {
      const settings = await this.getShopSettings();
      if (settings) {
        callback(settings);
      }
    }, 30000);

    return {
      unsubscribe: () => window.clearInterval(interval),
    };
  },
};

export { supabase };