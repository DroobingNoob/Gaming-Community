import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface OrderItem {
  title: string;
  platform: string;
  type: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderData {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...data } = await req.json()

    switch (action) {
      case 'createOrder':
        return await createOrder(data)
      case 'updateOrderStatus':
        return await updateOrderStatus(data)
      case 'updatePaymentDetails':
        return await updatePaymentDetails(data)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function createOrder(orderData: OrderData) {
  try {
    // Submit to Google Sheets
    const success = await submitToGoogleSheets(orderData)
    
    if (success) {
      return new Response(
        JSON.stringify({ success: true, orderCode: orderData.orderCode }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      throw new Error('Failed to submit order to Google Sheets')
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create order' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function updateOrderStatus(data: { orderCode: string; status: string; paymentDetails?: any }) {
  try {
    const success = await updateGoogleSheetsStatus(data.orderCode, data.status, data.paymentDetails)
    
    return new Response(
      JSON.stringify({ success }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error updating order status:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update order status' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function updatePaymentDetails(data: { orderCode: string; paymentDetails: any }) {
  try {
    const success = await updateGoogleSheetsPayment(data.orderCode, data.paymentDetails)
    
    return new Response(
      JSON.stringify({ success }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error updating payment details:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update payment details' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function submitToGoogleSheets(orderData: OrderData): Promise<boolean> {
  try {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRiqJDoZP-k5sZhoI_JB-V-MI3Xr1WCSpnNkuYYmbkI2PLzYCphK-fk7IPjzJFJyaIxg/exec'
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addOrder',
        data: orderData
      })
    })

    return response.ok
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error)
    return false
  }
}

async function updateGoogleSheetsStatus(orderCode: string, status: string, paymentDetails?: any): Promise<boolean> {
  try {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRiqJDoZP-k5sZhoI_JB-V-MI3Xr1WCSpnNkuYYmbkI2PLzYCphK-fk7IPjzJFJyaIxg/exec'
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateStatus',
        orderCode,
        status,
        paymentDetails
      })
    })

    return response.ok
  } catch (error) {
    console.error('Error updating Google Sheets status:', error)
    return false
  }
}

async function updateGoogleSheetsPayment(orderCode: string, paymentDetails: any): Promise<boolean> {
  try {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRiqJDoZP-k5sZhoI_JB-V-MI3Xr1WCSpnNkuYYmbkI2PLzYCphK-fk7IPjzJFJyaIxg/exec'
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updatePayment',
        orderCode,
        paymentDetails
      })
    })

    return response.ok
  } catch (error) {
    console.error('Error updating Google Sheets payment:', error)
    return false
  }
}