const API_URL = import.meta.env.VITE_API_URL;

export interface Coupon {
  id: string;
  name: string;
  code: string;
  coupon_type: "fixed_amount" | "percentage" | "message_only";
  value: number;
  min_order_amount: number;
  min_game_count: number;
  message: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  finalAmount?: number;
  error?: string;
}

export const couponService = {
  async getAllCoupons(): Promise<Coupon[]> {
    try {
      const response = await fetch(`${API_URL}/coupons`);
      if (!response.ok) throw new Error("Failed to fetch coupons");
      return await response.json();
    } catch (error) {
      console.error("Error fetching coupons:", error);
      return [];
    }
  },

  async getActiveCoupons(): Promise<Coupon[]> {
    try {
      const response = await fetch(`${API_URL}/coupons/active`);
      if (!response.ok) throw new Error("Failed to fetch active coupons");
      return await response.json();
    } catch (error) {
      console.error("Error fetching active coupons:", error);
      return [];
    }
  },

  async validateCoupon(
    code: string,
    orderAmount: number,
    gameCount: number
  ): Promise<CouponValidationResponse> {
    try {
      const response = await fetch(
        `${API_URL}/coupons/${encodeURIComponent(code)}/validate?orderAmount=${orderAmount}&gameCount=${gameCount}`
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          valid: false,
          error: data.error || "Coupon validation failed",
        };
      }

      return data;
    } catch (error) {
      console.error("Error validating coupon:", error);
      return {
        valid: false,
        error: "Coupon validation failed",
      };
    }
  },

  async createCoupon(payload: Omit<Coupon, "id" | "created_at" | "updated_at">): Promise<Coupon | null> {
    try {
      const response = await fetch(`${API_URL}/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create coupon");
      return await response.json();
    } catch (error) {
      console.error("Error creating coupon:", error);
      return null;
    }
  },

  async updateCoupon(
    id: string,
    payload: Omit<Coupon, "id" | "created_at" | "updated_at">
  ): Promise<Coupon | null> {
    try {
      const response = await fetch(`${API_URL}/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update coupon");
      return await response.json();
    } catch (error) {
      console.error("Error updating coupon:", error);
      return null;
    }
  },

  async deleteCoupon(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/coupons/${id}`, {
        method: "DELETE",
      });

      return response.ok;
    } catch (error) {
      console.error("Error deleting coupon:", error);
      return false;
    }
  },
};