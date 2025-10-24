import React, { useState, useEffect } from 'react';
import { X, User, Phone, ShoppingBag, Gift, Copy, Check, MessageCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { BackendService } from '../services/backendService';
 
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
  hasNewsletterDiscount?: boolean;
  user?: any;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderComplete,
  hasNewsletterDiscount = false,
  user
}) => {
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [copiedOrderCode, setCopiedOrderCode] = useState(false);
  const [copiedUpiId, setCopiedUpiId] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const mysteryBoxEligible = subtotal >= 3000;
  
  // Apply discounts
  let discountAmount = 0;
  // if (hasNewsletterDiscount && appliedCoupon === 'NEWSLETTER10') {
  //   discountAmount = subtotal * 0.1; // 10% discount
  // } else  
    if (appliedCoupon === 'MYSTERYBOX' && mysteryBoxEligible) {
    // Mystery box is free, no monetary discount but eligible for free game
  } else if (appliedCoupon === 'FESTIVALOFF' && subtotal>=799) {
    discountAmount = 0.1 * subtotal < 150 ? 0.1 * subtotal : 150; // 15% discount from flash sale
  } else if (couponDiscount > 0) {
    discountAmount = couponDiscount;
  }

  const total = Math.max(0, subtotal - discountAmount);

  // Generate unique order code
  const generateOrderCode = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    
    return `GC${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // setCurrentStep('details');
      // setCustomerName(user?.user_metadata?.full_name || '');
      // setCustomerMobile(user?.user_metadata?.mobile_number || '');
      // setAppliedCoupon('');
      // setCouponDiscount(0);
      // setOrderCode('');
      // setCopiedOrderCode(false);
      // setCopiedUpiId(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const onClickClose = () =>{
     setCurrentStep('details');
      setCustomerName(user?.user_metadata?.full_name || '');
      setCustomerMobile(user?.user_metadata?.mobile_number || '');
      setAppliedCoupon('');
      setCouponDiscount(0);
      setOrderCode('');
      setCopiedOrderCode(false);
      setCopiedUpiId(false);
    onClose();
  }

  const handleApplyCoupon = () => {
    const coupon = appliedCoupon.toUpperCase();
    
    // if (coupon === 'NEWSLETTER10' && hasNewsletterDiscount) {
    //   setCouponDiscount(subtotal * 0.1);
    //   toast.success('Newsletter discount applied! 10% off');
    // } else  
      if (coupon === 'MYSTERYBOX' && mysteryBoxEligible) {
      setCouponDiscount(0); // No monetary discount, but eligible for mystery box
      toast.success('Mystery Box coupon applied! Free mystery game included');
    } else if (coupon === 'FESTIVALOFF' && subtotal>=799) {
        if(subtotal * 0.1 < 150){
      setCouponDiscount(0.1*subtotal);
        }
        else {
          setCouponDiscount(150);
        }
      toast.success('Flash Sale discount applied! 10% off');
    } else {
      setCouponDiscount(0);
      toast.error('Invalid coupon code or not eligible');
    }
  };

  const handleProceedToPayment = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!customerMobile.trim() || !/^[6-9]\d{9}$/.test(customerMobile.trim())) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsProcessing(true);

    try {
      // Generate order code
      const newOrderCode = generateOrderCode();
      setOrderCode(newOrderCode);

      // Prepare order data
      const orderData = {
        orderCode: newOrderCode,
        timestamp: new Date().toISOString(),
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        items: cartItems.map(item => ({
          title: item.title,
          platform: item.platform,
          type: item.type,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        subtotalAmount: subtotal,
        appliedCoupon: appliedCoupon || undefined,
        discountAmount: discountAmount,
        totalAmount: total,
        status: 'Payment Pending',
        mysteryBoxEligible: mysteryBoxEligible && appliedCoupon === 'MYSTERYBOX',
        paymentMethod: 'UPI',
        paymentStatus: 'Pending'
      };

   
     // Bypass backend, simulate success
// const result = { success: true, orderCode: newOrderCode };  

// setCurrentStep("payment"); 
// toast.success('Order created successfully! Please complete the payment.');

      // Submit order to backend
      const result = await BackendService.createOrder(orderData);
        
      if (result.success) {
        setCurrentStep('payment');
        toast.success('Order created successfully! Please complete the payment.');
      } else {
        throw new Error('Failed to create order');
      } 
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }; 

  const copyToClipboard = (text: string, type: 'orderCode' | 'upiId') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'orderCode') {
        setCopiedOrderCode(true);
        setTimeout(() => setCopiedOrderCode(false), 2000);
        toast.success('Order code copied!');
      } else {
        setCopiedUpiId(true);
        setTimeout(() => setCopiedUpiId(false), 2000);
        toast.success('UPI ID copied!');
      }
    });
  };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = '+919266514434';
    
    // Prepare order details message
    const itemsList = cartItems.map(item => 
      `• ${item.title} (${item.platform} - ${item.type}) - ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}`
    ).join('\n');

    const message = `🎮 *GAMING COMMUNITY - ORDER DETAILS*

📋 *Order Code:* ${orderCode}
👤 *Name:* ${customerName}
📱 *Mobile:* ${customerMobile}

🛒 *Items Ordered:*
${itemsList}

💰 *Payment Summary:*
Subtotal: ₹${subtotal}${discountAmount > 0 ? `\nDiscount: -₹${discountAmount}` : ''}${appliedCoupon && discountAmount > 0 ? `\nCoupon: ${appliedCoupon}` : ''}${mysteryBoxEligible && appliedCoupon === 'MYSTERYBOX' ? '\n🎁 Mystery Box: FREE' : ''}
*Total Paid: ₹${total}*

✅ *Payment Status:* Completed via UPI
📸 *Payment Screenshot:* Attached

Please confirm my order and provide delivery details. Thank you! 🙏`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Mark order as completed
    setCurrentStep('confirmation');
    
    // Auto-close modal and complete order after a delay
    // setTimeout(() => {
    //   onOrderComplete();
    //   onClose();
    // }, 2000); 
  };

  const renderCustomerDetails = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Customer Details</h3>
        <p className="text-gray-600">Please provide your information to proceed</p>
      </div>

      <div className="space-y-4">
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
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setCustomerMobile(value);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              required
            />
          </div>
        </div>

        {/* Coupon Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code (Optional)</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={appliedCoupon}
              onChange={(e) => setAppliedCoupon(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Enter coupon code"
            />
            <button
              onClick={handleApplyCoupon}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Apply
            </button>
          </div>
          
          {/* Available Coupons */}
          <div className="mt-3 space-y-2">
            {/* {hasNewsletterDiscount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-green-500" />
                  <span className="text-green-800 font-medium text-sm">NEWSLETTER10 - 10% off (Available)</span>
                </div>
                  <button
          onClick={() => setAppliedCoupon("NEWSLETTER10")}
          className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md"
        >
          Use
        </button> 
              </div>
            )} */} 
            {mysteryBoxEligible && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-800 font-medium text-sm">MYSTERYBOX - Free Mystery Game (Available)</span>
                </div>
                  <button
          onClick={() => setAppliedCoupon("MYSTERYBOX")}
          className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded-md"
        >
          Use
        </button> 
              </div>
            )}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-orange-500" />
                <span className="text-orange-800 font-medium text-sm">FESTIVALOFF - 10% off UPTO 150 (Min ₹799)</span>
              </div>
              {subtotal.toFixed(2) >= 799 ? (<button
        onClick={() => setAppliedCoupon("FESTIVALOFF")}
        className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded-md"
        disabled={total.toFixed(2)<799}
      >
        Use
      </button>  ) : (<span>Not Eligible</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-4">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {appliedCoupon && `(${appliedCoupon})`}</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {mysteryBoxEligible && appliedCoupon === 'MYSTERYBOX' && (
            <div className="flex justify-between text-purple-600">
              <span>🎁 Mystery Box Game</span>
              <span>FREE</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-500">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleProceedToPayment}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Creating Order...</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            <span>Proceed to Payment</span>
          </>
        )}
      </button>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Complete Your Payment</h3>
        <p className="text-gray-600">Scan the QR code or use the UPI ID to pay</p>
      </div>

      {/* Order Code Display */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center">
          <h4 className="font-bold text-blue-800 mb-3">Your Order Code</h4>
          <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl font-mono font-bold text-blue-600">{orderCode}</span>
              <button
                onClick={() => copyToClipboard(orderCode, 'orderCode')}
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                {copiedOrderCode ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">Please include this code in your payment remarks</p>
          </div>
        </div>
      </div>

{/* Payment Instructions with Shining Border */}
<div
  style={{
    position: "relative",
    borderRadius: "12px",
    padding: "2px",
    background:
      "linear-gradient(90deg, #22c55e, #10b981, #ffffff, #10b981, #22c55e)", // added white for shine
    backgroundSize: "300% 300%",
    animation: "shine 4s linear infinite",
  }}
>
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
    <h4 className="font-bold text-green-800 mb-4 flex items-center space-x-2">
      <Clock className="w-5 h-5" />
      <span>Payment Instructions</span>
    </h4>
    <div className="space-y-3 text-sm text-green-700">
      <div className="flex items-start space-x-3">
        <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
        <span>Scan the QR code below or use the UPI ID to make payment</span>
      </div>
      <div className="flex items-start space-x-3">
        <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
        <span>Enter the amount: <strong>₹{total.toFixed(2)}</strong></span>
      </div>
      <div className="flex items-start space-x-3">
        <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
        <span>Add your order code <strong>{orderCode}</strong> in the payment remarks/description</span>
      </div>
      <div className="flex items-start space-x-3">
        <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
        <span>Take a screenshot of the successful payment</span>
      </div>
      <div className="flex items-start space-x-3">
        <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
        <span>Click "Send Payment Details" below to share your payment screenshot via WhatsApp</span>
      </div>
    </div>
  </div>
</div>

<style>
{`
@keyframes shine {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`}
</style>
 {/* Send Payment Details Button */}
       <button
        onClick={handleWhatsAppRedirect}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Click to Place Order on WhatsApp</span>
      </button>

      <p className="text-xs text-gray-500 text-center">
        After payment, click the button above to send your payment screenshot and order details to our WhatsApp for quick verification and delivery.
      </p>

      
 
      {/* QR Code and UPI Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="text-center">
          <h4 className="font-bold text-gray-800 mb-4">Scan QR Code</h4>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <img
              src="/1000050269.jpg"
              alt="UPI QR Code"
              className="w-full max-w-xs mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600 mt-3">Scan with any UPI app</p>
          </div>
        </div>
 
        {/* UPI ID */}
        <div className="text-center">
          <h4 className="font-bold text-gray-800 mb-4">Or Use UPI ID</h4>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                  <span className="flex-1 font-mono text-sm">9069043750@Yes</span>
                  <button
                    onClick={() => copyToClipboard('9069043750@Yes', 'upiId')}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    {copiedUpiId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="font-bold text-lg text-green-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="font-mono text-sm">{orderCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-yellow-800 text-sm">
            <p className="font-semibold mb-1">Important:</p>
            <p>Please ensure you include the order code <strong>{orderCode}</strong> in your payment remarks. This helps us identify your payment quickly and process your order faster.</p>
          </div>
        </div>
      </div>

      {/* Send Payment Details Button */}
      {/* <button
        onClick={handleWhatsAppRedirect}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Send Payment Details via WhatsApp</span>
      </button>

      <p className="text-xs text-gray-500 text-center">
        After payment, click the button above to send your payment screenshot and order details to our WhatsApp for quick verification and delivery.
      </p> */}
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Order Submitted Successfully!</h3>
        <p className="text-gray-600">Your order details have been sent via WhatsApp</p>
      </div>
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h4 className="font-bold text-green-800 mb-3">What happens next?</h4>
        <div className="space-y-2 text-sm text-green-700 text-left">
          <p>• Our team will verify your payment within 15 minutes</p>
          <p>• You'll receive your game access details via WhatsApp</p>
          <p>• Setup support is available 24/7 if needed</p>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Order Code: <span className="font-mono font-bold">{orderCode}</span>
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-t-3xl sm:rounded-3xl w-full sm:max-w-4xl sm:w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-full">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {currentStep === 'details' && 'Checkout'}
              {currentStep === 'payment' && 'Payment'}
              {currentStep === 'confirmation' && 'Order Confirmed'}
            </h2>
          </div>
          <button
            onClick={onClickClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'details' ? 'text-cyan-600' : currentStep === 'payment' || currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 'details' ? 'bg-cyan-100' : currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {currentStep === 'payment' || currentStep === 'confirmation' ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-400' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'payment' ? 'text-cyan-600' : currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 'payment' ? 'bg-cyan-100' : currentStep === 'confirmation' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {currentStep === 'confirmation' ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep === 'confirmation' ? 'bg-green-400' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 'confirmation' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {currentStep === 'confirmation' ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentStep === 'details' && renderCustomerDetails()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'confirmation' && renderConfirmation()}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal; 