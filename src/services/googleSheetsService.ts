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
  totalAmount: number;
  status: string;
}

export class GoogleSheetsService {
  private static readonly SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2A6eBmjBkqH-BavLeNZT3lTsxzrx3yCJQPRT52dlXvX-X0sBcXVhC0zKS5AFH9L8R/exec';
 
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

  static async updateOrderStatus(orderCode: string, status: string): Promise<boolean> {
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
          status
        })
      });

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }
}

// Google Apps Script code to be deployed as a web app
// This should be added to your Google Apps Script project:

/*
STEP-BY-STEP SETUP INSTRUCTIONS:

1. CREATE GOOGLE SPREADSHEET:
   - Go to https://sheets.google.com
   - Create a new spreadsheet named "Gaming Community Orders"
   - Copy the spreadsheet ID from the URL (the long string between /d/ and /edit)
   - Example: https://docs.google.com/spreadsheets/d/1ABC123DEF456GHI789JKL/edit
   - The ID is: 1ABC123DEF456GHI789JKL

2. CREATE GOOGLE APPS SCRIPT:
   - Go to https://script.google.com
   - Create a new project named "Gaming Community Order API"
   - Replace the default code with the code below
   - IMPORTANT: Replace 'YOUR_SPREADSHEET_ID_HERE' with your actual spreadsheet ID

3. DEPLOY AS WEB APP:
   - Click "Deploy" → "New deployment"
   - Choose type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the web app URL and replace the SCRIPT_URL above

GOOGLE APPS SCRIPT CODE (paste this in your Google Apps Script project):

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addOrder') {
      return addOrderToSheet(data.data);
    } else if (action === 'updateStatus') {
      return updateOrderStatus(data.orderCode, data.status);
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
      sheet.getRange(1, 1, 1, 10).setValues([[
        'Order Code', 'Date/Time', 'Customer Name', 'Customer Mobile', 'Items', 'Total Amount', 'Status', 'Customer Info', 'Platform', 'Type'
      ]]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, 10);
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
    
    // Add new row
    const newRow = [
      orderData.orderCode,
      new Date(orderData.timestamp),
      orderData.customerName,
      orderData.customerMobile,
      itemsText,
      orderData.totalAmount,
      orderData.status,
      'WhatsApp Payment Screenshot Pending',
      platforms,
      types
    ];
    
    sheet.appendRow(newRow);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 10);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
  }
}

function updateOrderStatus(orderCode, status) {
  try {
    // REPLACE 'YOUR_SPREADSHEET_ID_HERE' WITH YOUR ACTUAL SPREADSHEET ID
    const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderCode) {
        sheet.getRange(i + 1, 7).setValue(status);
        sheet.getRange(i + 1, 8).setValue(`Status updated: ${new Date().toLocaleString()}`);
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
  }
}

ADDITIONAL SETUP NOTES:

1. PERMISSIONS:
   - When you first run the script, Google will ask for permissions
   - Grant access to Google Sheets and Google Drive
   - This is necessary for the script to read/write to your spreadsheet

2. TESTING:
   - After deployment, test the integration by placing a test order
   - Check if the data appears in your Google Spreadsheet
   - Verify all columns are populated correctly

3. SPREADSHEET STRUCTURE:
   The spreadsheet will have these columns:
   - Order Code: Unique identifier (GC + timestamp)
   - Date/Time: When the order was placed
   - Customer Name: Customer's full name
   - Customer Mobile: Customer's phone number
   - Items: List of purchased games/subscriptions
   - Total Amount: Order total in ₹
   - Status: Payment status (Payment Pending, Confirmed, etc.)
   - Customer Info: Additional notes about customer communication
   - Platform: PS4/PS5/Xbox platforms
   - Type: Rent/Permanent types

4. SECURITY:
   - The web app URL should be kept secure
   - Only share it with authorized personnel
   - Consider adding additional validation if needed

5. TROUBLESHOOTING:
   - If orders don't appear, check the Google Apps Script execution log
   - Verify the spreadsheet ID is correct
   - Ensure the web app is deployed with "Anyone" access
   - Check that the SCRIPT_URL in the frontend matches your deployed URL
*/