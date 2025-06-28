// Backend service for secure API calls
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qbjymmzgysjzhmmkafaz.supabase.co';

export interface OrderItem {
  title: string;
  platform: string;
  type: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderData {
  orderCode: string;
  timestamp: string;
  customerName: string;
  customerMobile: string;
  items: OrderItem[];
  subtotalAmount: number;
  appliedCoupon?: string;
  discountAmount?: number;
  totalAmount: number;
  status: string;
  mysteryBoxEligible?: boolean;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
}

export interface CreateOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export class BackendService {
  // Orders API
  static async createOrder(orderData: OrderData): Promise<{ success: boolean; orderCode?: string }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'createOrder',
          ...orderData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false };
    }
  }

  static async updateOrderStatus(orderCode: string, status: string, paymentDetails?: any): Promise<boolean> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'updateOrderStatus',
          orderCode,
          status,
          paymentDetails
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  static async updatePaymentDetails(orderCode: string, paymentDetails: any): Promise<boolean> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'updatePaymentDetails',
          orderCode,
          paymentDetails
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating payment details:', error);
      return false;
    }
  }

  // Payments API
  static async createRazorpayOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'createOrder',
          ...orderData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  static async verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'verifyPayment',
          orderId,
          paymentId,
          signature
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.valid;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  static async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'getPaymentDetails',
          paymentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw error;
    }
  }

  static async testRazorpayConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'testConnection'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.connected;
    } catch (error) {
      console.error('Error testing Razorpay connection:', error);
      return false;
    }
  }

  // Get Razorpay key for frontend (this can remain public)
  static getKeyId(): string {
    return 'rzp_test_97bx92TAEIdxcG'; // This is safe to expose
  }
}