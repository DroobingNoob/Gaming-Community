// Razorpay payment service
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email?: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
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

export class RazorpayService {
  // Test credentials - Replace with your actual Razorpay credentials
  private static readonly KEY_ID = 'rzp_test_97bx92TAEIdxcG'; // Replace with your actual key
  private static readonly KEY_SECRET = 'nDe73UP4KMgrDdypgifQA3o2'; // Replace with your actual secret
  
  // Create order on Razorpay
  static async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // In a real application, this should be done on your backend server
      // For demo purposes, we'll simulate the order creation
      
      // This is a mock response - in production, you need to call Razorpay's API from your backend
      const mockOrder: CreateOrderResponse = {
        id: `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        entity: 'order',
        amount: orderData.amount,
        amount_paid: 0,
        amount_due: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000)
      };

      return mockOrder;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  // Initialize Razorpay payment
  static initializePayment(options: RazorpayOptions): void {
    try {
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded');
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initializing Razorpay payment:', error);
      throw error;
    }
  }

  // Verify payment signature (should be done on backend)
  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      // In production, this verification should be done on your backend server
      // using the Razorpay webhook or API
      
      // For demo purposes, we'll return true
      // In real implementation, you would use crypto to verify the signature
      console.log('Verifying payment:', { orderId, paymentId, signature });
      return true;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  // Get payment details
  static async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      // In production, this should be called from your backend
      // For demo purposes, we'll return mock data
      return {
        id: paymentId,
        status: 'captured',
        amount: 0,
        currency: 'INR',
        method: 'upi',
        created_at: Math.floor(Date.now() / 1000)
      };
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }

  // Get Razorpay key for frontend
  static getKeyId(): string {
    return this.KEY_ID;
  }
}

// Extend Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

/*
SETUP INSTRUCTIONS FOR RAZORPAY:

1. CREATE RAZORPAY ACCOUNT:
   - Go to https://razorpay.com
   - Sign up for a new account
   - Complete KYC verification for live mode

2. GET API CREDENTIALS:
   - Go to Dashboard → Settings → API Keys
   - Generate API Keys for Test/Live mode
   - Copy Key ID and Key Secret

3. UPDATE CREDENTIALS:
   - Replace KEY_ID and KEY_SECRET in this file with your actual credentials
   - For production, store these in environment variables

4. BACKEND INTEGRATION (RECOMMENDED):
   - Create order endpoint: POST /api/orders
   - Verify payment endpoint: POST /api/verify-payment
   - Use Razorpay's Node.js SDK on backend
   - Never expose Key Secret on frontend

5. WEBHOOK SETUP (OPTIONAL):
   - Go to Dashboard → Settings → Webhooks
   - Add webhook URL: https://yourdomain.com/api/webhooks/razorpay
   - Select events: payment.captured, payment.failed
   - Use webhook secret for verification

6. TEST PAYMENTS:
   - Use test credentials for development
   - Test card: 4111 1111 1111 1111
   - Test UPI: success@razorpay
   - Test wallet: Paytm, PhonePe, etc.

IMPORTANT SECURITY NOTES:
- Never store Key Secret on frontend
- Always verify payments on backend
- Use HTTPS in production
- Implement proper error handling
- Log all payment transactions
*/