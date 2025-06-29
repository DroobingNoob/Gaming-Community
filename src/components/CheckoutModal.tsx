import React, { useState, useEffect } from 'react';
import { X, Copy, Check, CreditCard, Smartphone, MessageCircle, Download, FileSpreadsheet, User, Phone, Tag, AlertCircle, Shield, Gift } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<'summary' | 'payment' | 'confirmation'>('summary');
  const [orderCode, setOrderCode] = useState('');
  const [copiedOrderCode, setCopiedOrderCode] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [paymentError, setPaymentError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed' | 'mock'>('checking');
  const [hasError, setHasError] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('summary');
      setOrderCode('');
      setCopiedOrderCode(false);
      setIsSubmittingOrder(false);
      setIsProcessingPayment(false);
      setAppliedCoupon('');
      setCouponInput('');
      setCouponError('');
      setRazorpayOrderId('');
      setPaymentDetails(null);
      setPaymentError('');
      setHasError(false);
      setIsMockMode(false);
      setRedirectCountdown(0);
      
      // Pre-fill customer details if user is logged in
      if (user) {
        setCustomerName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
        setCustomerMobile(user.user_metadata?.mobile_number || '');
      }
      
      // Auto-apply newsletter discount if available
      if (hasNewsletterDiscount) {
        setAppliedCoupon('NEWSLETTER10');
      }
      
      testBackendConnection();
    }
  }, [isOpen, user, hasNewsletterDiscount]);

  // Countdown effect for WhatsApp redirect
  useEffect(() => {
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0 && currentStep === 'confirmation' && paymentDetails) {
      // Redirect to WhatsApp when countdown reaches 0
      redirectToWhatsAppWithOrderDetails();
    }
  }, [redirectCountdown, currentStep, paymentDetails]);

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Checkout error:', event.error);
      setHasError(true);
      setIsProcessingPayment(false);
      setIsSubmittingOrder(false);
      toast.error('An error occurred. Please try again.');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setIsProcessingPayment(false);
      setIsSubmittingOrder(false);
      toast.error('Payment processing failed. Please try again.');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isOpen) return null;

  // Test connection on modal open
  const testBackendConnection = async () => {
    try {
      setConnectionStatus('checking');
      console.log('Testing backend connection...');
      
      const isConnected = await BackendService.testRazorpayConnection();
      console.log('Backend connection test result:', isConnected);
      
      if (isConnected) {
        setConnectionStatus('connected');
        setIsMockMode(false);
      } else {
        setConnectionStatus('mock');
        setIsMockMode(true);
        console.warn('Razorpay connection failed, using mock mode');
        toast.info('Payment system in demo mode - orders will be tracked but payments are simulated');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('mock');
      setIsMockMode(true);
      toast.warning('Payment system in demo mode due to connectivity issues');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Enhanced coupon logic with newsletter discount
  const applyCouponDiscount = (amount: number, coupon: string) => {
    if (coupon === 'NEWSLETTER10') {
      return amount * 0.9; // 10% off for newsletter subscribers
    }
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

  // Submit order to backend
  const submitOrderToBackend = async (code: string, razorpayOrderId?: string) => {
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
        mysteryBoxEligible: appliedCoupon === 'MYSTERYBOX' && subtotal >= 3000,
        newsletterDiscount: appliedCoupon === 'NEWSLETTER10',
        razorpayOrderId: razorpayOrderId,
        paymentStatus: 'Pending'
      };

      console.log('Submitting order to backend:', orderData);
      const result = await BackendService.createOrder(orderData);
      
      if (result.success) {
        toast.success('Order submitted to tracking system!');
      } else {
        toast.error('Failed to submit order to tracking system');
      }
      
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit order to tracking system');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // WhatsApp redirect function
  const redirectToWhatsAppWithOrderDetails = () => {
    try {
      const phoneNumber = '9266514434';
      
      // Format order details message
      let message = `🎮 *Gaming Community - Order Confirmation* 🎮

*Order ID:* ${orderCode}

*Customer Details:*
👤 Name: ${customerName}
📱 Mobile: ${customerMobile}

*Items Ordered:*`;

      // Add each item to the message
      cartItems.forEach((item, index) => {
        message += `
${index + 1}. *${item.title}*
   📱 Platform: ${item.platform}
   🎯 Type: ${item.type}
   💰 Price: ₹${item.price}
   📦 Quantity: ${item.quantity}
   💵 Subtotal: ₹${(item.price * item.quantity).toFixed(2)}`;
      });

      // Add pricing summary
      message += `

*Order Summary:*
💰 Subtotal: ₹${subtotal.toFixed(2)}`;

      if (appliedCoupon && discount > 0) {
        message += `
🎟️ Coupon (${appliedCoupon}): -₹${discount.toFixed(2)}`;
      }

      if (appliedCoupon === 'MYSTERYBOX' && subtotal >= 3000) {
        message += `
🎁 Mystery Box: FREE mystery game included!`;
      }

      if (appliedCoupon === 'NEWSLETTER10') {
        message += `
📧 Newsletter Discount: 10% off first order`;
      }

      message += `
💳 *Total Paid: ₹${total.toFixed(2)}*`;

      if (paymentDetails) {
        message += `

*Payment Details:*
🆔 Payment ID: ${paymentDetails.razorpayPaymentId}
✅ Status: ${paymentDetails.paymentStatus}
💳 Method: ${paymentDetails.paymentMethod}`;
      }

      if (isMockMode) {
        message += `

⚠️ *Note:* This was a demo order for testing purposes.`;
      } else {
        message += `

🚀 *Delivery:* Your games will be delivered within 1 hour!
📞 *Support:* Available 24/7 for any assistance

Thank you for choosing Gaming Community! 🎮✨`;
      }

      // Create WhatsApp URL and redirect
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      console.log('Redirecting to WhatsApp with order details');
      window.open(whatsappUrl, '_blank');
      
      // Close the modal and complete the order after redirect
      setTimeout(() => {
        handleOrderComplete();
      }, 1000);
      
    } catch (error) {
      console.error('Error redirecting to WhatsApp:', error);
      toast.error('Failed to redirect to WhatsApp. Please contact support manually.');
    }
  };

  const handleApplyCoupon = () => {
    try {
      setCouponError('');
      
      if (!couponInput.trim()) {
        setCouponError('Please enter a coupon code');
        return;
      }

      const coupon = couponInput.trim().toUpperCase();
      
      // Prevent applying other coupons if newsletter discount is already applied
      if (appliedCoupon === 'NEWSLETTER10' && coupon !== 'NEWSLETTER10') {
        setCouponError('Newsletter discount is already applied. Remove it first to use another coupon.');
        return;
      }
      
      if (coupon === 'GAMINGCOMMUNITY50') {
        if (appliedCoupon && appliedCoupon !== 'NEWSLETTER10') {
          setCouponError('A coupon is already applied');
          return;
        }
        setAppliedCoupon(coupon);
        setCouponInput('');
        toast.success('50% discount applied!');
      } else if (coupon === 'MYSTERYBOX') {
        if (appliedCoupon && appliedCoupon !== 'NEWSLETTER10') {
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
      } else if (coupon === 'NEWSLETTER10') {
        if (!hasNewsletterDiscount) {
          setCouponError('This discount is only available for newsletter subscribers');
          return;
        }
        setAppliedCoupon(coupon);
        setCouponInput('');
        toast.success('Newsletter discount applied!');
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Error applying coupon');
    }
  };

  const handleRemoveCoupon = () => {
    try {
      // Don't allow removing newsletter discount if it was auto-applied
      if (appliedCoupon === 'NEWSLETTER10' && hasNewsletterDiscount) {
        toast.info('Newsletter discount cannot be removed. It\'s automatically applied for newsletter subscribers.');
        return;
      }
      
      setAppliedCoupon('');
      setCouponError('');
      toast.info('Coupon removed');
    } catch (error) {
      console.error('Error removing coupon:', error);
    }
  };

  // Fixed mobile number input handler
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value;
      // Only allow digits and limit to 10 characters
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setCustomerMobile(numericValue);
    } catch (error) {
      console.error('Error handling mobile change:', error);
    }
  };

  const handleProceedToPayment = async () => {
    try {
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
      setPaymentError('');

      setIsProcessingPayment(true);
      
      console.log('Starting payment process...');
      console.log('Mock mode:', isMockMode);
      
      // Submit order to backend first
      await submitOrderToBackend(code);
      
      if (isMockMode) {
        // In mock mode, simulate the payment process
        console.log('Running in mock mode - simulating payment');
        
        // Create a mock order
        const mockOrder = {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(total * 100),
          currency: 'INR',
          receipt: code
        };
        
        setRazorpayOrderId(mockOrder.id);
        
        // Simulate payment success after a short delay
        setTimeout(() => {
          const mockPaymentResponse = {
            razorpay_order_id: mockOrder.id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: `sig_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          
          handlePaymentSuccess(mockPaymentResponse);
        }, 2000);
        
        setCurrentStep('payment');
        toast.info('Demo payment initiated - this will complete automatically');
        return;
      }
      
      // Real Razorpay flow
      console.log('Creating Razorpay order...');
      const razorpayOrder = await BackendService.createRazorpayOrder({
        amount: Math.round(total * 100), // Convert to paise
        currency: 'INR',
        receipt: code
      });

      console.log('Razorpay order created:', razorpayOrder);
      setRazorpayOrderId(razorpayOrder.id);
      
      // Check if Razorpay SDK is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded. Please check your internet connection.');
      }

      // Initialize Razorpay payment
      const options = {
        key: BackendService.getKeyId(),
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Gaming Community',
        description: `Order ${code}`,
        order_id: razorpayOrder.id,
        handler: handlePaymentSuccess,
        prefill: {
          name: customerName,
          contact: customerMobile,
        },
        theme: {
          color: '#06b6d4'
        },
        modal: {
          ondismiss: handlePaymentDismiss
        }
      };

      console.log('Opening Razorpay with options:', options);
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setCurrentStep('payment');
      
    } catch (error) {
      console.error('Error creating payment:', error);
      setPaymentError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error('Failed to initialize payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      setIsProcessingPayment(true);
      
      console.log('Payment response received:', response);
      
      // Verify payment signature via backend
      const isValid = await BackendService.verifyPaymentSignature(
        response.razorpay_order_id,
        response.razorpay_payment_id,
        response.razorpay_signature
      );

      console.log('Payment verification result:', isValid);

      if (isValid) {
        // Get payment details via backend
        const paymentInfo = await BackendService.getPaymentDetails(response.razorpay_payment_id);
        
        setPaymentDetails({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          paymentMethod: paymentInfo.method || 'UPI',
          paymentStatus: isMockMode ? 'Demo Completed' : 'Completed'
        });

        // Update order status via backend
        await BackendService.updatePaymentDetails(orderCode, {
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          paymentMethod: paymentInfo.method || 'UPI',
          paymentStatus: isMockMode ? 'Demo Completed' : 'Completed'
        });

        toast.success(isMockMode ? 'Demo payment completed!' : 'Payment successful!');
        setCurrentStep('confirmation');
        
        // Start countdown for WhatsApp redirect
        setRedirectCountdown(5); // 5 second countdown
        
      } else {
        toast.error('Payment verification failed. Please contact support.');
        setPaymentError('Payment verification failed');
      }
    } catch (error) {
      console.error('Error processing payment success:', error);
      toast.error('Error processing payment. Please contact support.');
      setPaymentError('Error processing payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentDismiss = () => {
    try {
      setIsProcessingPayment(false);
      toast.info('Payment cancelled. You can try again.');
    } catch (error) {
      console.error('Error handling payment dismiss:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedOrderCode(true);
        setTimeout(() => setCopiedOrderCode(false), 2000);
        toast.success('Order code copied!');
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy order code');
    }
  };

  const handleWhatsAppContact = () => {
    try {
      const phoneNumber = '9266514434';
      let message = `Hi! I have a question about my order: ${orderCode}

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
        if (appliedCoupon === 'NEWSLETTER10') {
          message += `\nNewsletter Discount: 10% off first order`;
        }
      }

      message += `\nTotal: ₹${total.toFixed(2)}`;

      if (paymentDetails) {
        message += `\n\nPayment Details:
Payment ID: ${paymentDetails.razorpayPaymentId}
Payment Status: ${paymentDetails.paymentStatus}`;
      }

      if (paymentError) {
        message += `\n\nPayment Error: ${paymentError}`;
      }

      if (isMockMode) {
        message += `\n\nNote: This was a demo order for testing purposes.`;
      }
      
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast.error('Failed to open WhatsApp');
    }
  };

  const handleOrderComplete = () => {
    try {
      // Clear form data
      setOrderCode('');
      setCustomerName('');
      setCustomerMobile('');
      setAppliedCoupon('');
      setCouponInput('');
      setCouponError('');
      setPaymentDetails(null);
      setRazorpayOrderId('');
      setPaymentError('');
      setCurrentStep('summary');
      setRedirectCountdown(0);
      
      onOrderComplete();
      onClose();
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  // Error fallback UI
  if (hasError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            We encountered an error while processing your request. Please try again.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setHasError(false);
                setCurrentStep('summary');
              }}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSummaryStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Order Summary
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">Review your order and enter your details</p>
      </div>

      {/* Newsletter Discount Banner */}
      {hasNewsletterDiscount && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-green-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-green-500 p-1.5 sm:p-2 rounded-full flex-shrink-0">
              <Gift className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-green-800 text-sm sm:text-base">Newsletter Subscriber Discount Active!</h3>
              <p className="text-green-700 text-xs sm:text-sm">You get 10% off your first order as a newsletter subscriber</p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className={`rounded-xl p-3 sm:p-4 border ${
        connectionStatus === 'connected' ? 'bg-green-50 border-green-200' :
        connectionStatus === 'mock' ? 'bg-yellow-50 border-yellow-200' :
        connectionStatus === 'failed' ? 'bg-red-50 border-red-200' :
        'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'mock' ? 'bg-yellow-500' :
            connectionStatus === 'failed' ? 'bg-red-500' :
            'bg-blue-500 animate-pulse'
          }`}></div>
          <span className="text-xs sm:text-sm font-medium">
            {connectionStatus === 'checking' && 'Checking payment system...'}
            {connectionStatus === 'connected' && 'Payment system ready'}
            {connectionStatus === 'mock' && 'Demo mode - payments simulated'}
            {connectionStatus === 'failed' && 'Payment system unavailable'}
          </span>
        </div>
        {connectionStatus === 'mock' && (
          <p className="text-xs text-yellow-700 mt-2">
            Orders will be tracked but payments are simulated for demonstration purposes.
          </p>
        )}
      </div>

      {/* Customer Details Form */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center space-x-2">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
          <span>Customer Details</span>
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter your full name"
                required
                autoComplete="name"
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
                onChange={handleMobileChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                required
                autoComplete="tel"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-3">
          <span className="text-red-500">*</span> Required fields. This information will be used for order tracking and delivery.
        </p>
      </div>

      {/* Coupon Code Section */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center space-x-2">
          <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          <span>Coupon Code</span>
        </h3>
        
        {!appliedCoupon ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter coupon code"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base touch-manipulation"
              >
                Apply
              </button>
            </div>
            
            {couponError && (
              <div className="flex items-center space-x-2 text-red-600 text-xs sm:text-sm">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{couponError}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white/70 rounded-lg p-2 sm:p-3 border border-orange-300">
                <div className="font-bold text-orange-800 text-xs sm:text-sm">GAMINGCOMMUNITY50</div>
                <div className="text-orange-700 text-xs">50% off all games</div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 sm:p-3 border border-purple-300">
                <div className="font-bold text-purple-800 text-xs sm:text-sm">MYSTERYBOX</div>
                <div className="text-purple-700 text-xs">Free mystery game (₹3000+ orders)</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-green-800 flex items-center space-x-2 text-sm sm:text-base">
                  <span>Coupon Applied: {appliedCoupon}</span>
                  {appliedCoupon === 'NEWSLETTER10' && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                      <Gift className="w-3 h-3" />
                      <span>Newsletter</span>
                    </div>
                  )}
                </div>
                <div className="text-green-700 text-xs sm:text-sm">
                  {appliedCoupon === 'NEWSLETTER10' && `10% newsletter discount: -₹${discount.toFixed(2)}`}
                  {appliedCoupon === 'GAMINGCOMMUNITY50' && `50% discount: -₹${discount.toFixed(2)}`}
                  {appliedCoupon === 'MYSTERYBOX' && 'Free mystery game included!'}
                </div>
              </div>
              {appliedCoupon !== 'NEWSLETTER10' && (
                <button
                  onClick={handleRemoveCoupon}
                  className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium touch-manipulation"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 sm:p-4">
            <img
              src={item.image}
              alt={item.title}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2">{item.title}</h3>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                <span className="bg-cyan-400 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">{item.platform}</span>
                <span className="bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">{item.type}</span>
              </div>
              <div className="flex items-center justify-between mt-1 sm:mt-2">
                <span className="text-cyan-600 font-bold text-sm sm:text-base">₹{item.price}</span>
                <span className="text-gray-600 text-xs sm:text-sm">Qty: {item.quantity}</span>
                <span className="font-bold text-gray-800 text-sm sm:text-base">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2">
        <div className="flex justify-between items-center text-base sm:text-lg">
          <span className="text-gray-700">Subtotal:</span>
          <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
        </div>
        
        {appliedCoupon && discount > 0 && (
          <div className="flex justify-between items-center text-green-600 text-sm sm:text-base">
            <span>Discount ({appliedCoupon}):</span>
            <span className="font-semibold">-₹{discount.toFixed(2)}</span>
          </div>
        )}
        
        {appliedCoupon === 'MYSTERYBOX' && subtotal >= 3000 && (
          <div className="flex justify-between items-center text-purple-600 text-sm sm:text-base">
            <span>Mystery Box:</span>
            <span className="font-semibold">FREE</span>
          </div>
        )}
        
        <div className="flex justify-between items-center text-lg sm:text-xl font-bold border-t pt-2">
          <span className="text-gray-800">Total Amount:</span>
          <span className="text-xl sm:text-2xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            ₹{total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors text-sm sm:text-base touch-manipulation"
        >
          Cancel
        </button>
        <button
          onClick={handleProceedToPayment}
          disabled={isSubmittingOrder || isProcessingPayment || !customerName.trim() || !customerMobile.trim() || connectionStatus === 'checking'}
          className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation"
        >
          {isProcessingPayment ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>{isMockMode ? 'Demo Payment' : 'Pay with Razorpay'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          {isMockMode ? 'Demo Payment Processing' : 'Payment Processing'}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {isMockMode ? 'Simulating payment for demonstration' : 'Complete your payment with Razorpay'}
        </p>
      </div>

      {/* Customer Details Display */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-green-200">
        <h3 className="font-bold text-green-800 mb-2 sm:mb-3 text-sm sm:text-base">Customer Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-green-700 text-sm sm:text-base">
          <div className="flex items-center space-x-2">
            <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span><strong>Name:</strong> {customerName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span><strong>Mobile:</strong> {customerMobile}</span>
          </div>
        </div>
      </div>

      {/* Order Code Display */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-200">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">Your Order Code</h3>
          <div className="bg-white rounded-xl p-3 sm:p-4 border-2 border-dashed border-cyan-400">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <span className="text-lg sm:text-2xl font-mono font-bold text-cyan-600 tracking-wider break-all">{orderCode}</span>
              <button
                onClick={() => copyToClipboard(orderCode)}
                className="text-cyan-600 hover:text-cyan-700 transition-colors p-1 rounded hover:bg-cyan-50 flex-shrink-0 touch-manipulation"
              >
                {copiedOrderCode ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Keep this order code for tracking your purchase
          </p>
        </div>
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-200">
          <h3 className="font-bold text-purple-800 mb-2 sm:mb-3 text-sm sm:text-base">Applied Coupon</h3>
          <div className="text-purple-700 text-sm sm:text-base">
            <div className="font-semibold flex items-center space-x-2">
              <span>{appliedCoupon}</span>
              {appliedCoupon === 'NEWSLETTER10' && (
                <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                  <Gift className="w-3 h-3" />
                  <span>Newsletter</span>
                </div>
              )}
            </div>
            <div className="text-xs sm:text-sm">
              {appliedCoupon === 'NEWSLETTER10' && `10% newsletter discount: -₹${discount.toFixed(2)}`}
              {appliedCoupon === 'GAMINGCOMMUNITY50' && `50% discount applied: -₹${discount.toFixed(2)}`}
              {appliedCoupon === 'MYSTERYBOX' && 'You will receive a FREE mystery game!'}
            </div>
          </div>
        </div>
      )}

      {/* Payment Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center space-x-2">
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <span>{isMockMode ? 'Demo Payment Mode' : 'Secure Payment with Razorpay'}</span>
        </h3>
        <div className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
          {isMockMode ? (
            <>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                <span>This is a demonstration - no real payment will be processed</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span>Your order will still be tracked in our system</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span>Contact support for real payment processing</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span>Supports UPI, Cards, Net Banking, and Wallets</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                <span>Complete payment in the Razorpay popup window</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Total */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
            ₹{total.toFixed(2)}
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            {isMockMode ? 'Demo amount (no charge)' : 'Total amount to be paid'}
          </p>
        </div>
      </div>

      {/* Processing Message */}
      {isProcessingPayment && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-yellow-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-orange-500 flex-shrink-0"></div>
            <div>
              <h4 className="font-bold text-orange-800 text-sm sm:text-base">
                {isMockMode ? 'Processing Demo Payment' : 'Processing Payment'}
              </h4>
              <p className="text-orange-700 text-xs sm:text-sm">
                {isMockMode 
                  ? 'Demo payment will complete automatically in a few seconds'
                  : 'Please complete the payment in the Razorpay window'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Error */}
      {paymentError && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-red-800 text-sm sm:text-base">Payment Error</h4>
              <p className="text-red-700 text-xs sm:text-sm">{paymentError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => setCurrentStep('summary')}
          disabled={isProcessingPayment}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm sm:text-base touch-manipulation"
        >
          Back
        </button>
        <button
          onClick={handleWhatsAppContact}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Contact Support</span>
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-green-200">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          {isMockMode ? 'Demo Order Completed!' : 'Payment Successful!'}
        </h2>
        <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
          Your order <strong className="font-mono text-cyan-600">{orderCode}</strong> has been confirmed.
        </p>
        
        {paymentDetails && (
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-green-200 mb-3 sm:mb-4">
            <h4 className="font-bold text-green-800 mb-2 text-sm sm:text-base">Payment Details</h4>
            <div className="text-xs sm:text-sm text-gray-700 space-y-1">
              <p><strong>Payment ID:</strong> {paymentDetails.razorpayPaymentId}</p>
              <p><strong>Method:</strong> {paymentDetails.paymentMethod}</p>
              <p><strong>Status:</strong> <span className="text-green-600 font-semibold">{paymentDetails.paymentStatus}</span></p>
            </div>
          </div>
        )}
        
        {appliedCoupon && (
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-green-200 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-700">
              <strong>Coupon Applied:</strong> {appliedCoupon}
              {appliedCoupon === 'NEWSLETTER10' && (
                <span className="block text-green-600 font-semibold mt-1">
                  🎁 10% newsletter discount applied!
                </span>
              )}
              {appliedCoupon === 'MYSTERYBOX' && subtotal >= 3000 && (
                <span className="block text-purple-600 font-semibold mt-1">
                  🎁 You will receive a FREE mystery game!
                </span>
              )}
            </p>
          </div>
        )}
        
        {/* WhatsApp Redirect Countdown */}
        {redirectCountdown > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 mb-4">
            <div className="flex items-center justify-center space-x-3">
              <MessageCircle className="w-6 h-6 text-blue-500 animate-pulse" />
              <div>
                <h4 className="font-bold text-blue-800">Redirecting to WhatsApp</h4>
                <p className="text-blue-700 text-sm">
                  Redirecting in {redirectCountdown} seconds with your order details...
                </p>
              </div>
            </div>
            <button
              onClick={redirectToWhatsAppWithOrderDetails}
              className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Go to WhatsApp Now</span>
            </button>
          </div>
        )}
        
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-green-200">
          <p className="text-xs sm:text-sm text-gray-700">
            {isMockMode ? (
              <>
                This was a <strong>demonstration order</strong>. For real purchases, contact our support team.
                <br />
                Your order details have been saved for reference.
              </>
            ) : (
              <>
                Your games will be delivered within <strong>1 hour</strong>.
                You'll receive delivery confirmation via WhatsApp.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl sm:w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">
                {currentStep === 'summary' ? '1' : currentStep === 'payment' ? '2' : '3'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {currentStep === 'summary' && 'Order Summary'}
              {currentStep === 'payment' && (isMockMode ? 'Demo Payment' : 'Payment')}
              {currentStep === 'confirmation' && 'Confirmation'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessingPayment}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 touch-manipulation"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentStep === 'summary' && renderSummaryStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'confirmation' && renderConfirmationStep()}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;