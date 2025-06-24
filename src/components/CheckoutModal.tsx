import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, Smartphone, MessageCircle, Download, FileSpreadsheet, User, Phone, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  platform: string;
  type: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderComplete: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onOrderComplete 
}) => {
  const [currentStep, setCurrentStep] = useState<'summary' | 'payment' | 'confirmation'>('summary');
  const [orderCode, setOrderCode] = useState('');
  const [copiedOrderCode, setCopiedOrderCode] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Coupon logic
  const applyCouponDiscount = (amount: number, coupon: string) => {
    if (coupon === 'GAMINGCOMMUNITY50') {
      return amount * 0.5; // 50% off
    }
    if (coupon === 'MYSTERYBOX' && amount >= 3000) {
      return amount; // No discount, but qualifies for mystery box
    }
    return amount;
  };

  const total = applyCouponDiscount(subtotal, appliedCoupon);
  const discount = subtotal - total;

  // Generate unique order code with date, time, seconds, and milliseconds
  const generateOrderCode = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    
    // Format: GC + YYMMDD + HHMMSS + MMM
    return `GC${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
  };

  // Submit order to Google Sheets with the NEW URL
  const submitOrderToGoogleSheets = async (code: string) => {
    try {
      setIsSubmittingOrder(true);
      
      const orderData = {
        orderCode: code,
        timestamp: new Date().toISOString(),
        customerName: customerName,
        customerMobile: customerMobile,
        items: cartItems.map(item => ({
          title: item.title,
          platform: item.platform,
          type: item.type,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        subtotalAmount: subtotal,
        appliedCoupon: appliedCoupon,
        discountAmount: discount,
        totalAmount: total,
        status: 'Payment Pending',
        mysteryBoxEligible: appliedCoupon === 'MYSTERYBOX' && subtotal >= 3000
      };

      // UPDATED GOOGLE APPS SCRIPT URL - Using your new webapp URL
      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRiqJDoZP-k5sZhoI_JB-V-MI3Xr1WCSpnNkuYYmbkI2PLzYCphK-fk7IPjzJFJyaIxg/exec';
      
      console.log('Submitting order to:', GOOGLE_SCRIPT_URL);
      console.log('Order data:', orderData);
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
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
      toast.success('Order submitted to tracking system!');
      
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit order to tracking system');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const coupon = couponInput.trim().toUpperCase();
    
    if (coupon === 'GAMINGCOMMUNITY50') {
      if (appliedCoupon) {
        setCouponError('A coupon is already applied');
        return;
      }
      setAppliedCoupon(coupon);
      setCouponInput('');
      toast.success('50% discount applied!');
    } else if (coupon === 'MYSTERYBOX') {
      if (appliedCoupon) {
        setCouponError('A coupon is already applied');
        return;
      }
      if (subtotal < 3000) {
        setCouponError('This coupon requires a minimum order of ₹3000');
        return;
      }
      setAppliedCoupon(coupon);
      setCouponInput('');
      toast.success('Mystery Box coupon applied! You will receive a free mystery game.');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponError('');
    toast.info('Coupon removed');
  };

  const handleProceedToPayment = async () => {
    // Validate customer details
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!customerMobile.trim()) {
      toast.error('Please enter your mobile number');
      return;
    }
    
    // Validate mobile number (basic validation)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(customerMobile.trim())) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const code = generateOrderCode();
    setOrderCode(code);
    setCurrentStep('payment');
    
    // Submit order to Google Sheets
    await submitOrderToGoogleSheets(code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedOrderCode(true);
      setTimeout(() => setCopiedOrderCode(false), 2000);
      toast.success('Order code copied!');
    });
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = '9266514434';
    let message = `Hi! I want to send payment screenshot for Order Code: ${orderCode}

Customer Details:
Name: ${customerName}
Mobile: ${customerMobile}

Order Details:
${cartItems.map(item => 
  `- ${item.title} (${item.platform}, ${item.type}) - ₹${item.price} x ${item.quantity}`
).join('\n')}

Subtotal: ₹${subtotal.toFixed(2)}`;

    if (appliedCoupon) {
      message += `\nCoupon Applied: ${appliedCoupon}`;
      if (discount > 0) {
        message += `\nDiscount: -₹${discount.toFixed(2)}`;
      }
      if (appliedCoupon === 'MYSTERYBOX') {
        message += `\nMystery Box: FREE mystery game included!`;
      }
    }

    message += `\nTotal: ₹${total.toFixed(2)}

I have made the payment via UPI. Please find the screenshot attached.`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleOrderComplete = () => {
    setCurrentStep('confirmation');
    setTimeout(() => {
      onOrderComplete();
      onClose();
      setCurrentStep('summary');
      setOrderCode('');
      setCustomerName('');
      setCustomerMobile('');
      setAppliedCoupon('');
      setCouponInput('');
      setCouponError('');
    }, 3000);
  };

  const renderSummaryStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Order Summary
        </h2>
        <p className="text-gray-600">Review your order and enter your details</p>
      </div>

      {/* Customer Details Form */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <User className="w-5 h-5 text-cyan-600" />
          <span>Customer Details</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                required
              />
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          <span className="text-red-500">*</span> Required fields. This information will be used for order tracking and delivery.
        </p>
      </div>

      {/* Coupon Code Section */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Tag className="w-5 h-5 text-orange-600" />
          <span>Coupon Code</span>
        </h3>
        
        {!appliedCoupon ? (
          <div className="space-y-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="Enter coupon code"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Apply
              </button>
            </div>
            
            {couponError && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{couponError}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/70 rounded-lg p-3 border border-orange-300">
                <div className="font-bold text-orange-800 text-sm">GAMINGCOMMUNITY50</div>
                <div className="text-orange-700 text-xs">50% off all games</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-purple-300">
                <div className="font-bold text-purple-800 text-sm">MYSTERYBOX</div>
                <div className="text-purple-700 text-xs">Free mystery game (₹3000+ orders)</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-green-800">Coupon Applied: {appliedCoupon}</div>
                <div className="text-green-700 text-sm">
                  {appliedCoupon === 'GAMINGCOMMUNITY50' && `50% discount: -₹${discount.toFixed(2)}`}
                  {appliedCoupon === 'MYSTERYBOX' && 'Free mystery game included!'}
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{item.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="bg-cyan-400 text-white px-2 py-1 rounded text-xs">{item.platform}</span>
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">{item.type}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-cyan-600 font-bold">₹{item.price}</span>
                <span className="text-gray-600">Qty: {item.quantity}</span>
                <span className="font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between items-center text-lg">
          <span className="text-gray-700">Subtotal:</span>
          <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
        </div>
        
        {appliedCoupon && discount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span>Discount ({appliedCoupon}):</span>
            <span className="font-semibold">-₹{discount.toFixed(2)}</span>
          </div>
        )}
        
        {appliedCoupon === 'MYSTERYBOX' && subtotal >= 3000 && (
          <div className="flex justify-between items-center text-purple-600">
            <span>Mystery Box:</span>
            <span className="font-semibold">FREE</span>
          </div>
        )}
        
        <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
          <span className="text-gray-800">Total Amount:</span>
          <span className="text-2xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            ₹{total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleProceedToPayment}
          disabled={isSubmittingOrder || !customerName.trim() || !customerMobile.trim()}
          className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmittingOrder ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              <span>Proceed to Payment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Complete Your Payment
        </h2>
        <p className="text-gray-600">Scan the QR code to pay via UPI</p>
      </div>

      {/* Customer Details Display */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
        <h3 className="font-bold text-green-800 mb-3">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-700">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span><strong>Name:</strong> {customerName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span><strong>Mobile:</strong> {customerMobile}</span>
          </div>
        </div>
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-200">
          <h3 className="font-bold text-purple-800 mb-3">Applied Coupon</h3>
          <div className="text-purple-700">
            <div className="font-semibold">{appliedCoupon}</div>
            <div className="text-sm">
              {appliedCoupon === 'GAMINGCOMMUNITY50' && `50% discount applied: -₹${discount.toFixed(2)}`}
              {appliedCoupon === 'MYSTERYBOX' && 'You will receive a FREE mystery game!'}
            </div>
          </div>
        </div>
      )}

      {/* Order Code Display */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Your Unique Order Code</h3>
          <div className="bg-white rounded-xl p-4 border-2 border-dashed border-cyan-400">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl font-mono font-bold text-cyan-600 tracking-wider">{orderCode}</span>
              <button
                onClick={() => copyToClipboard(orderCode)}
                className="text-cyan-600 hover:text-cyan-700 transition-colors p-1 rounded hover:bg-cyan-50"
              >
                {copiedOrderCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            <strong>IMPORTANT:</strong> Include this exact code in your UPI payment remarks
          </p>
        </div>
      </div>

      {/* Order Tracking Notice */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="bg-green-500 rounded-full p-2">
            <FileSpreadsheet className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-green-800">Order Recorded</h4>
            <p className="text-sm text-green-700">Your order has been automatically saved to our tracking system</p>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <QrCode className="w-6 h-6 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">Scan to Pay</h3>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
          <img
            src="/UPI.jpg"
            alt="UPI QR Code"
            className="w-64 h-64 mx-auto object-contain rounded-lg shadow-lg"
          />
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
            ₹{total.toFixed(2)}
          </div>
          <p className="text-sm text-gray-600">
            Scan with any UPI app (GPay, PhonePe, Paytm, etc.)
          </p>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-orange-500" />
          <span>Payment Instructions</span>
        </h3>
        <ol className="space-y-2 text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
            <span>Scan the QR code with your UPI app</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
            <span>Enter amount: <strong>₹{total.toFixed(2)}</strong></span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
            <div>
              <span>Add order code in remarks/note:</span>
              <div className="bg-white rounded px-2 py-1 mt-1 font-mono text-sm border border-orange-300">
                {orderCode}
              </div>
            </div>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
            <span>Complete the payment</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">5</span>
            <span>Take a screenshot of payment confirmation</span>
          </li>
        </ol>
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-green-500" />
          <span>Send Payment Screenshot</span>
        </h3>
        <p className="text-gray-700 mb-4">
          After payment, send your screenshot via WhatsApp:
        </p>
        
        <button
          onClick={handleWhatsAppContact}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Send Payment Screenshot via WhatsApp</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep('summary')}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleOrderComplete}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          I've Sent Payment Screenshot
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Submitted!</h2>
        <p className="text-gray-600 mb-4">
          Your order <strong className="font-mono text-cyan-600">{orderCode}</strong> has been submitted successfully.
        </p>
        
        {appliedCoupon && (
          <div className="bg-white rounded-xl p-4 border border-green-200 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Coupon Applied:</strong> {appliedCoupon}
              {appliedCoupon === 'MYSTERYBOX' && subtotal >= 3000 && (
                <span className="block text-purple-600 font-semibold mt-1">
                  🎁 You will receive a FREE mystery game!
                </span>
              )}
            </p>
          </div>
        )}
        
        <div className="bg-white rounded-xl p-4 border border-green-200">
          <p className="text-sm text-gray-700">
            We'll verify your payment and deliver your games within <strong>15 minutes</strong>.
            You'll receive confirmation via WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {currentStep === 'summary' ? '1' : currentStep === 'payment' ? '2' : '3'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {currentStep === 'summary' && 'Order Summary'}
              {currentStep === 'payment' && 'Payment'}
              {currentStep === 'confirmation' && 'Confirmation'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'summary' && renderSummaryStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'confirmation' && renderConfirmationStep()}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;