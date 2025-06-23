// Cart storage service using Google Sheets
export interface CartStorageItem {
  userId: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  platform: string;
  type: string;
  timestamp: string;
}

export class CartStorageService {
  private static readonly SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRiqJDoZP-k5sZhoI_JB-V-MI3Xr1WCSpnNkuYYmbkI2PLzYCphK-fk7IPjzJFJyaIxg/exec';

  // Save cart items for a user
  static async saveCartItems(userId: string, cartItems: any[]): Promise<boolean> {
    try {
      const cartData = cartItems.map(item => ({
        userId,
        productId: item.id.split('-')[0], // Extract product ID from combined ID
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        platform: item.platform,
        type: item.type,
        timestamp: new Date().toISOString()
      }));

      const response = await fetch(this.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveCart',
          userId,
          cartData
        })
      });

      return true;
    } catch (error) {
      console.error('Error saving cart to Google Sheets:', error);
      return false;
    }
  }

  // Load cart items for a user
  static async loadCartItems(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.SCRIPT_URL}?action=loadCart&userId=${userId}`, {
        method: 'GET',
        mode: 'cors', // Try CORS for GET requests
      });

      if (response.ok) {
        const data = await response.json();
        return data.cartItems || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error loading cart from Google Sheets:', error);
      return [];
    }
  }

  // Clear cart for a user
  static async clearCart(userId: string): Promise<boolean> {
    try {
      const response = await fetch(this.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clearCart',
          userId
        })
      });

      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  // Clean up old cart data (older than 24 hours)
  static async cleanupOldCarts(): Promise<boolean> {
    try {
      const response = await fetch(this.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cleanupOldCarts'
        })
      });

      return true;
    } catch (error) {
      console.error('Error cleaning up old carts:', error);
      return false;
    }
  }
}

/*
GOOGLE APPS SCRIPT CODE FOR CART STORAGE:

Add this to your existing Google Apps Script project:

// Cart storage functions
function saveCart(userId, cartData) {
  try {
    const CART_SPREADSHEET_ID = 'YOUR_CART_SPREADSHEET_ID_HERE'; // Create a separate spreadsheet for cart data
    const sheet = SpreadsheetApp.openById(CART_SPREADSHEET_ID).getActiveSheet();
    
    // Clear existing cart data for this user
    clearUserCart(userId, sheet);
    
    // Add headers if this is the first row
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 9).setValues([[
        'User ID', 'Product ID', 'Title', 'Price', 'Quantity', 'Image', 'Platform', 'Type', 'Timestamp'
      ]]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
    }
    
    // Add new cart items
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
    
    if (data.length <= 1) return { cartItems: [] }; // No data or only headers
    
    const cartItems = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) { // Check if user ID matches
        cartItems.push({
          id: `${data[i][1]}-${data[i][6]}-${data[i][7]}`, // Reconstruct ID
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
    
    // Delete rows from bottom to top to avoid index shifting
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
    
    // Delete old rows from bottom to top
    for (let i = data.length - 1; i >= 1; i--) {
      const timestamp = new Date(data[i][8]); // Timestamp column
      if (timestamp < twentyFourHoursAgo) {
        sheet.deleteRow(i + 1);
      }
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Update the main doPost function to handle cart actions
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addOrder') {
      return ContentService.createTextOutput(JSON.stringify(addOrderToSheet(data.data)));
    } else if (action === 'updateStatus') {
      return ContentService.createTextOutput(JSON.stringify(updateOrderStatus(data.orderCode, data.status)));
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

// Update the doGet function to handle cart loading
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
1. Create a new Google Spreadsheet for cart storage (separate from orders)
2. Copy the spreadsheet ID and replace 'YOUR_CART_SPREADSHEET_ID_HERE' in the code above
3. Add the cart functions to your existing Google Apps Script project
4. Redeploy the web app to include the new functionality
5. Set up a daily trigger to run cleanupOldCarts() function automatically
*/