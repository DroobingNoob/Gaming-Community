// Google Sheets integration service
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
  // Razorpay payment details
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

export class GoogleSheetsService {
  private static readonly SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRiqJDoZP-k5sZhoI_JB-V-MI3Xr1WCSpnNkuYYmbkI2PLzYCphK-fk7IPjzJFJyaIxg/exec';

  static async submitOrder(orderData: OrderData): Promise<boolean> {
    try {
      const response = await fetch(this.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addOrder',
          data: orderData
        })
      });

      // Since we're using no-cors mode, we can't read the response
      // But we'll assume success if no error is thrown
      return true;
    } catch (error) {
      console.error('Error submitting order to Google Sheets:', error);
      return false;
    }
  }

  static async updateOrderStatus(orderCode: string, status: string, paymentDetails?: any): Promise<boolean> {
    try {
      const response = await fetch(this.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          orderCode,
          status,
          paymentDetails
        })
      });

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  static async updatePaymentDetails(orderCode: string, paymentDetails: any): Promise<boolean> {
    try {
      const response = await fetch(this.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updatePayment',
          orderCode,
          paymentDetails
        })
      });

      return true;
    } catch (error) {
      console.error('Error updating payment details:', error);
      return false;
    }
  }
}

// Google Apps Script code to be deployed as a web app
// This should be added to your Google Apps Script project:

/*
UPDATED GOOGLE APPS SCRIPT CODE:

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addOrder') {
      return addOrderToSheet(data.data);
    } else if (action === 'updateStatus') {
      return updateOrderStatus(data.orderCode, data.status, data.paymentDetails);
    } else if (action === 'updatePayment') {
      return updatePaymentDetails(data.orderCode, data.paymentDetails);
    } else if (action === 'saveCart') {
      return ContentService.createTextOutput(JSON.stringify(saveCart(data.userId, data.cartData)));
    } else if (action === 'clearCart') {
      return ContentService.createTextOutput(JSON.stringify(clearUserCart(data.userId)));
    } else if (action === 'cleanupOldCarts') {
      return ContentService.createTextOutput(JSON.stringify(cleanupOldCarts()));
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Invalid action'}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
  }
}

function addOrderToSheet(orderData) {
  try {
    // REPLACE 'YOUR_SPREADSHEET_ID_HERE' WITH YOUR ACTUAL SPREADSHEET ID
    const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    // If this is the first row, add headers
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 18).setValues([[
        'Order Code', 'Date/Time', 'Customer Name', 'Customer Mobile', 'Items', 
        'Subtotal Amount', 'Applied Coupon', 'Discount Amount', 'Total Amount', 'Status', 
        'Mystery Box Eligible', 'Razorpay Order ID', 'Razorpay Payment ID', 'Razorpay Signature',
        'Payment Method', 'Payment Status', 'Platform', 'Type'
      ]]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, 18);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
    }
    
    // Format items for display
    const itemsText = orderData.items.map(item => 
      `${item.title} (${item.platform}, ${item.type}) - ₹${item.price} x ${item.quantity}`
    ).join('\n');
    
    const platforms = [...new Set(orderData.items.map(item => item.platform))].join(', ');
    const types = [...new Set(orderData.items.map(item => item.type))].join(', ');
    
    // Add new row with Razorpay details
    const newRow = [
      orderData.orderCode,
      new Date(orderData.timestamp),
      orderData.customerName,
      orderData.customerMobile,
      itemsText,
      orderData.subtotalAmount || orderData.totalAmount,
      orderData.appliedCoupon || '',
      orderData.discountAmount || 0,
      orderData.totalAmount,
      orderData.status,
      orderData.mysteryBoxEligible ? 'Yes' : 'No',
      orderData.razorpayOrderId || '',
      orderData.razorpayPaymentId || '',
      orderData.razorpaySignature || '',
      orderData.paymentMethod || '',
      orderData.paymentStatus || 'Pending',
      platforms,
      types
    ];
    
    sheet.appendRow(newRow);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 18);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
  }
}

function updateOrderStatus(orderCode, status, paymentDetails) {
  try {
    // REPLACE 'YOUR_SPREADSHEET_ID_HERE' WITH YOUR ACTUAL SPREADSHEET ID
    const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderCode) {
        // Update status
        sheet.getRange(i + 1, 10).setValue(status);
        
        // Update payment details if provided
        if (paymentDetails) {
          if (paymentDetails.razorpayPaymentId) {
            sheet.getRange(i + 1, 13).setValue(paymentDetails.razorpayPaymentId);
          }
          if (paymentDetails.razorpaySignature) {
            sheet.getRange(i + 1, 14).setValue(paymentDetails.razorpaySignature);
          }
          if (paymentDetails.paymentMethod) {
            sheet.getRange(i + 1, 15).setValue(paymentDetails.paymentMethod);
          }
          if (paymentDetails.paymentStatus) {
            sheet.getRange(i + 1, 16).setValue(paymentDetails.paymentStatus);
          }
        }
        
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
  }
}

function updatePaymentDetails(orderCode, paymentDetails) {
  try {
    // REPLACE 'YOUR_SPREADSHEET_ID_HERE' WITH YOUR ACTUAL SPREADSHEET ID
    const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderCode) {
        // Update Razorpay payment details
        if (paymentDetails.razorpayPaymentId) {
          sheet.getRange(i + 1, 13).setValue(paymentDetails.razorpayPaymentId);
        }
        if (paymentDetails.razorpaySignature) {
          sheet.getRange(i + 1, 14).setValue(paymentDetails.razorpaySignature);
        }
        if (paymentDetails.paymentMethod) {
          sheet.getRange(i + 1, 15).setValue(paymentDetails.paymentMethod);
        }
        if (paymentDetails.paymentStatus) {
          sheet.getRange(i + 1, 16).setValue(paymentDetails.paymentStatus);
        }
        
        // Update status to Payment Completed
        sheet.getRange(i + 1, 10).setValue('Payment Completed');
        
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
  }
}

// Cart storage functions (existing code)
function saveCart(userId, cartData) {
  try {
    const CART_SPREADSHEET_ID = 'YOUR_CART_SPREADSHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(CART_SPREADSHEET_ID).getActiveSheet();
    
    clearUserCart(userId, sheet);
    
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 9).setValues([[
        'User ID', 'Product ID', 'Title', 'Price', 'Quantity', 'Image', 'Platform', 'Type', 'Timestamp'
      ]]);
      
      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
    }
    
    cartData.forEach(item => {
      sheet.appendRow([
        item.userId,
        item.productId,
        item.title,
        item.price,
        item.quantity,
        item.image,
        item.platform,
        item.type,
        item.timestamp
      ]);
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function loadCart(userId) {
  try {
    const CART_SPREADSHEET_ID = 'YOUR_CART_SPREADSHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(CART_SPREADSHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return { cartItems: [] };
    
    const cartItems = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        cartItems.push({
          id: `${data[i][1]}-${data[i][6]}-${data[i][7]}`,
          title: data[i][2],
          price: data[i][3],
          quantity: data[i][4],
          image: data[i][5],
          platform: data[i][6],
          type: data[i][7]
        });
      }
    }
    
    return { cartItems };
  } catch (error) {
    return { cartItems: [], error: error.toString() };
  }
}

function clearUserCart(userId, sheet = null) {
  try {
    const CART_SPREADSHEET_ID = 'YOUR_CART_SPREADSHEET_ID_HERE';
    if (!sheet) {
      sheet = SpreadsheetApp.openById(CART_SPREADSHEET_ID).getActiveSheet();
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === userId) {
        sheet.deleteRow(i + 1);
      }
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function cleanupOldCarts() {
  try {
    const CART_SPREADSHEET_ID = 'YOUR_CART_SPREADSHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(CART_SPREADSHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (let i = data.length - 1; i >= 1; i--) {
      const timestamp = new Date(data[i][8]);
      if (timestamp < twentyFourHoursAgo) {
        sheet.deleteRow(i + 1);
      }
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'loadCart') {
      const userId = e.parameter.userId;
      return ContentService.createTextOutput(JSON.stringify(loadCart(userId)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Invalid action'}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

SETUP INSTRUCTIONS:
1. Update your existing Google Apps Script with the code above
2. The spreadsheet will now have additional columns for Razorpay payment details
3. Orders will be stored with payment information after successful Razorpay transactions
4. Redeploy the web app to include the new functionality
*/