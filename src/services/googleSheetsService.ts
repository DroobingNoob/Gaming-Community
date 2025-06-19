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
  items: OrderItem[];
  totalAmount: number;
  status: string;
}

export class GoogleSheetsService {
  private static readonly SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLCNLrAB2e4OnW0ivBF7eVfV4eLYngWkLVXSr0V-CdxOgZQeDybGDBMyTRf5TIXuZJKQ/exec';

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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // If this is the first row, add headers
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 8).setValues([[
        'Order Code', 'Date/Time', 'Items', 'Total Amount', 'Status', 'Customer Info', 'Platform', 'Type'
      ]]);
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
      itemsText,
      orderData.totalAmount,
      orderData.status,
      'WhatsApp Payment Screenshot Pending',
      platforms,
      types
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
  }
}

function updateOrderStatus(orderCode, status) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderCode) {
        sheet.getRange(i + 1, 5).setValue(status);
        sheet.getRange(i + 1, 6).setValue(`Status updated: ${new Date().toLocaleString()}`);
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
  }
}
*/