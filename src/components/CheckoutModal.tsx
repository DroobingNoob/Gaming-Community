import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  ShoppingBag,
  Copy,
  Check,
  MessageCircle,
  AlertCircle,
  Gift,
  Tag,
} from "lucide-react";
import { toast } from "react-toastify";
import { BackendService } from "../services/backendService";
import ShopClosedModal from "./ShopClosedModal";
import {
  settingsService,
  PaymentSettings,
} from "../services/settingsService";
import { couponService, Coupon } from "../services/couponService";

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  platform: string;
  type: string;
  edition?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderComplete: () => void;
  hasNewsletterDiscount?: boolean;
  user?: any;
  isShopOpen?: boolean;
  shopClosedMessage?: string;
  shopWorkingHours?: {
    start: string;
    end: string;
  };
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderComplete,
  hasNewsletterDiscount = false,
  user,
  isShopOpen = true,
  shopClosedMessage = "The shop is currently closed. Please try again later.",
  shopWorkingHours,
}) => {
  const [currentStep, setCurrentStep] = useState<
    "details" | "payment" | "confirmation"
  >("details");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [appliedCouponData, setAppliedCouponData] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponBenefit, setCouponBenefit] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [copiedOrderCode, setCopiedOrderCode] = useState(false);
  const [copiedUpiId, setCopiedUpiId] = useState(false);
  const [showShopClosedModal, setShowShopClosedModal] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(
    null
  );
  const [loadingPaymentSettings, setLoadingPaymentSettings] = useState(false);

  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [customerCountryCode, setCustomerCountryCode] = useState("+91");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const rentGamesCount = cartItems.filter((item) =>
    item.type.toLowerCase().includes("rent")
  ).length;
  const total = Math.max(0, subtotal - couponDiscount);

  const generateOrderCode = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const milliseconds = now.getMilliseconds().toString().padStart(3, "0");

    return `GC${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep("details");
      setCustomerName("");
      setCustomerMobile("");
      setCouponCode("");
      setAppliedCoupon("");
      setAppliedCouponData(null);
      setCouponDiscount(0);
      setCouponBenefit("");
      setOrderCode("");
      setCopiedOrderCode(false);
      setCopiedUpiId(false);
      setCustomerCountryCode("+91");
    }
  }, [isOpen]);

  useEffect(() => {
    const loadPaymentSettings = async () => {
      if (!isOpen) return;
      setLoadingPaymentSettings(true);
      const settings = await settingsService.getPaymentSettings();
      setPaymentSettings(settings);
      setLoadingPaymentSettings(false);
    };

    loadPaymentSettings();
  }, [isOpen]);

  useEffect(() => {
    const loadAvailableCoupons = async () => {
      if (!isOpen) return;
      setLoadingCoupons(true);
      const data = await couponService.getActiveCoupons();
      setAvailableCoupons(data || []);
      setLoadingCoupons(false);
    };

    loadAvailableCoupons();
  }, [isOpen]);

  if (!isOpen) return null;

  const onClickClose = () => {
    setCurrentStep("details");
    setCustomerName("");
    setCustomerMobile("");
    setCouponCode("");
    setAppliedCoupon("");
    setAppliedCouponData(null);
    setCouponDiscount(0);
    setCouponBenefit("");
    setOrderCode("");
    setCopiedOrderCode(false);
    setCopiedUpiId(false);
    setCustomerCountryCode("+91");
    onClose();
  };

  const getCouponEligibility = (coupon: Coupon) => {
    const minAmount = Number(coupon.min_order_amount || 0);
    const minGames = Number(coupon.min_game_count || 0);

    const meetsAmount = subtotal >= minAmount;
    const meetsGameCount = rentGamesCount >= minGames;
    const isApplicable = meetsAmount && meetsGameCount;

    let reason = "";

    if (!meetsAmount && !meetsGameCount) {
      const remainingAmount = Math.max(0, minAmount - subtotal);
      const remainingGames = Math.max(0, minGames - rentGamesCount);
      reason = `Add ₹${remainingAmount} more and ${remainingGames} more game(s)`;
    } else if (!meetsAmount) {
      const remainingAmount = Math.max(0, minAmount - subtotal);
      reason = `Add ₹${remainingAmount} more to unlock`;
    } else if (!meetsGameCount) {
      const remainingGames = Math.max(0, minGames - rentGamesCount);
      reason = `Add ${remainingGames} more game(s) to unlock`;
    }

    return { isApplicable, reason };
  };

  const handleApplyCoupon = async (coupon?: string) => {
    const code = (coupon ?? couponCode).toUpperCase().trim();

    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    const result = await couponService.validateCoupon(
      code,
      subtotal,
      rentGamesCount
    );

    if (!result.valid || !result.coupon) {
      toast.error(result.error || "Invalid coupon");
      return;
    }

    const couponObj = result.coupon;

    setAppliedCoupon(couponObj.code);
    setAppliedCouponData(couponObj);
    setCouponDiscount(result.discount || 0);

    if (couponObj.coupon_type === "message_only") {
      setCouponBenefit(couponObj.message || couponObj.name);
      toast.success("Coupon applied");
    } else {
      setCouponBenefit(
        couponObj.message ||
          (couponObj.coupon_type === "fixed_amount"
            ? `₹${result.discount} discount`
            : `${couponObj.value}% discount`)
      );
      toast.success("Coupon applied");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon("");
    setAppliedCouponData(null);
    setCouponCode("");
    setCouponDiscount(0);
    setCouponBenefit("");
    toast.info("Coupon removed");
  };

  const fullCustomerMobile = `${customerCountryCode} ${customerMobile.trim()}`;

  const handleProceedToPayment = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

   if (!customerMobile.trim()) {
  toast.error("Please enter your mobile number");
  return;
}

    setIsProcessing(true);

    try {
      const newOrderCode = generateOrderCode();
      setOrderCode(newOrderCode);

      const itemsWithCoupon = [
        ...cartItems.map((item) => ({
          title:
            item.edition && item.edition !== "Standard"
              ? `${item.title} [${item.edition} Edition]`
              : item.title,
          platform: item.platform,
          type: item.type,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
      ];

      if (appliedCoupon) {
        itemsWithCoupon.push({
          title: `COUPON APPLIED: ${appliedCoupon}${
            appliedCouponData?.name ? ` (${appliedCouponData.name})` : ""
          }${couponBenefit ? ` - ${couponBenefit}` : ""}`,
          platform: "",
          type: "Coupon",
          price: 0,
          quantity: 1,
          subtotal: -couponDiscount,
        });
      }

      const orderData = {
        orderCode: newOrderCode,
        timestamp: new Date().toISOString(),
        customerName: customerName.trim(),
        customerMobile: fullCustomerMobile.trim(),
        items: itemsWithCoupon,
        subtotalAmount: subtotal,
        totalAmount: total,
        appliedCoupon: appliedCoupon || undefined,
        couponName: appliedCouponData?.name || undefined,
        couponMessage: couponBenefit || undefined,
        status: "Payment Pending",
        paymentMethod: "UPI",
        paymentStatus: "Pending",
      };

      try {
        const result = await BackendService.createOrder(orderData);

        if (!isShopOpen) {
          setIsProcessing(false);
          setShowShopClosedModal(true);
          return;
        }

        if (result.success) {
          setCurrentStep("payment");
          toast.success("Order created successfully! Please complete the payment.");
        } else {
          setCurrentStep("payment");
          toast.info("Order details prepared. Please complete payment.");
        }
      } catch (backendError) {
        console.error("Backend error, proceeding with client-side order:", backendError);

        if (!isShopOpen) {
          setIsProcessing(false);
          setShowShopClosedModal(true);
          return;
        }

        setCurrentStep("payment");
        toast.info("Order details prepared. Please complete payment.");
      }
    } catch (error) {
      console.error("Error in payment flow:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, type: "orderCode" | "upiId") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "orderCode") {
        setCopiedOrderCode(true);
        setTimeout(() => setCopiedOrderCode(false), 2000);
        toast.success("Order code copied!");
      } else {
        setCopiedUpiId(true);
        setTimeout(() => setCopiedUpiId(false), 2000);
        toast.success("UPI ID copied!");
      }
    });
  };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = "9266514434";

    const itemsList = cartItems
      .map((item) => {
        const editionText =
          item.edition && item.edition !== "Standard"
            ? ` [${item.edition} Edition]`
            : "";
        return `• ${item.title}${editionText} (${item.platform} - ${item.type}) - ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}`;
      })
      .join("\n");

    const couponText = appliedCoupon
      ? `\n🎁 *Coupon Applied:* ${appliedCoupon}${
          appliedCouponData?.name ? ` (${appliedCouponData.name})` : ""
        }${couponBenefit ? ` - ${couponBenefit}` : ""}`
      : "";

    const message = `🎮 *GAMING COMMUNITY - ORDER DETAILS*

📋 *Order Code:* ${orderCode}
👤 *Name:* ${customerName}
📱 *Mobile:* ${fullCustomerMobile}

🛒 *Items Ordered:*
${itemsList}${couponText}

💰 *Payment Summary:*
Subtotal: ₹${subtotal}${couponDiscount > 0 ? `\nDiscount: -₹${couponDiscount}` : ""}
*Total Paid: ₹${total}*

✅ *Payment Status:* Completed via UPI
📸 *Payment Screenshot:* Attached

Please confirm my order and provide delivery details. Thank you! 🙏`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setCurrentStep("confirmation");
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

  <div className="flex gap-2">
   <div className="w-28">
  <input
    type="text"
    value={customerCountryCode}
    onChange={(e) => setCustomerCountryCode(e.target.value)}
    className="w-full py-3 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white"
    placeholder="+91"
  />
</div>

    <div className="relative flex-1">
      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
  type="tel"
  value={customerMobile}
  onChange={(e) => {
    setCustomerMobile(e.target.value);
  }}
  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
  placeholder="Enter mobile number"
  required
/>
    </div>
  </div>
</div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center space-x-2 mb-3">
            <Gift className="w-5 h-5 text-orange-500" />
            <h4 className="font-bold text-gray-800">Apply Coupon</h4>
          </div>

          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">
              Available Coupons
            </h5>

            {loadingCoupons ? (
              <p className="text-sm text-gray-500">Loading available coupons...</p>
            ) : availableCoupons.length === 0 ? (
              <p className="text-sm text-gray-500">
                No active coupons available right now.
              </p>
            ) : (
              <div className="space-y-2">
                {availableCoupons.map((coupon) => {
                  const { isApplicable, reason } = getCouponEligibility(coupon);

                  return (
                    <div
                      key={coupon.id}
                      className={`rounded-xl border p-3 flex items-start justify-between gap-3 ${
                        isApplicable
                          ? "bg-white border-green-200"
                          : "bg-gray-100 border-gray-200 opacity-90"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-800">
                            {coupon.code}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            {coupon.name}
                          </span>

                          {isApplicable ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                              Available
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-300 text-gray-700 font-medium">
                              Locked
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          {coupon.coupon_type === "fixed_amount" && (
                            <span>₹{coupon.value} off</span>
                          )}
                          {coupon.coupon_type === "percentage" && (
                            <span>{coupon.value}% off</span>
                          )}
                          {coupon.coupon_type === "message_only" && (
                            <span>{coupon.message || "Special benefit coupon"}</span>
                          )}
                        </div>

                        {coupon.message && coupon.coupon_type !== "message_only" && (
                          <div className="text-xs text-gray-500 mt-1">
                            {coupon.message}
                          </div>
                        )}

                        {!isApplicable && (
                          <div className="text-xs text-red-500 mt-1">{reason}</div>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!isApplicable}
                        onClick={() => {
                          setCouponCode(coupon.code);
                          handleApplyCoupon(coupon.code);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          isApplicable
                            ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {isApplicable ? "Apply" : "Locked"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {appliedCoupon ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-green-800 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {appliedCoupon}
                  </div>
                  <div className="text-sm text-green-700">{couponBenefit}</div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-500 hover:text-red-700 font-medium text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={() => handleApplyCoupon()}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-3 rounded-lg font-semibold"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-3">Order Summary</h4>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.title} × {item.quantity}
              </span>
              <span className="font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Discount</span>
              <span>-₹{couponDiscount}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-orange-600">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleProceedToPayment}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Proceed to Payment"}
      </button>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Complete Payment</h3>
        <p className="text-gray-600">
          Pay the exact amount and then place the order on WhatsApp
        </p>
      </div>

      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-800">Order Code</span>
          <button
            onClick={() => copyToClipboard(orderCode, "orderCode")}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
          >
            {copiedOrderCode ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Copy
          </button>
        </div>
        <div className="font-mono text-lg font-bold text-cyan-700">{orderCode}</div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Amount to Pay</div>
          <div className="text-3xl font-bold text-green-600">₹{total.toFixed(2)}</div>
        </div>
      </div>

      <button
        onClick={handleWhatsAppRedirect}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Click to Place Order on WhatsApp</span>
      </button>

      <p className="text-xs text-gray-500 text-center">
        After payment, click the button above to send your payment screenshot and
        order details to our WhatsApp for quick verification and delivery.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center">
          <h4 className="font-bold text-gray-800 mb-4">Scan QR Code</h4>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            {loadingPaymentSettings ? (
              <p className="text-sm text-gray-500">Loading QR image...</p>
            ) : (
              <img
                src={
                  paymentSettings?.upi_qr_image
                    ? `${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}${paymentSettings.upi_qr_image}`
                    : "/UPI.jpg"
                }
                alt="UPI QR Code"
                className="w-full max-w-xs mx-auto rounded-lg shadow-md"
              />
            )}
            <p className="text-sm text-gray-600 mt-3">Scan with any UPI app</p>
          </div>
        </div>

        <div className="text-center">
          <h4 className="font-bold text-gray-800 mb-4">Or Use UPI ID</h4>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                  <span className="flex-1 font-mono text-sm">
                    {paymentSettings?.upi_id || ""}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(paymentSettings?.upi_id || "", "upiId")
                    }
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    {copiedUpiId ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="font-bold text-lg text-green-600">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="font-mono text-sm">{orderCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-yellow-800 text-sm">
            <p className="font-semibold mb-1">Important:</p>
            <p>
              Please ensure you include the order code <strong>{orderCode}</strong>{" "}
              in your payment remarks. This helps us identify your payment quickly
              and process your order faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Order Submitted Successfully!
        </h3>
        <p className="text-gray-600">
          Your order details have been sent via WhatsApp
        </p>
      </div>
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h4 className="font-bold text-green-800 mb-3">What happens next?</h4>
        <div className="space-y-2 text-sm text-green-700 text-left">
          <p>
            • Our team will verify your payment within 3 hours during normal load.
            If there are many orders, delivery may take upto 12 hours.
          </p>
          <p>• You'll receive your game access details via WhatsApp</p>
          <p>• Setup support is available if needed</p>
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
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-full">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {currentStep === "details" && "Checkout"}
              {currentStep === "payment" && "Payment"}
              {currentStep === "confirmation" && "Order Confirmed"}
            </h2>
          </div>
          <button
            onClick={onClickClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${
                currentStep === "details"
                  ? "text-cyan-600"
                  : currentStep === "payment" || currentStep === "confirmation"
                    ? "text-green-600"
                    : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === "details"
                    ? "bg-cyan-100"
                    : currentStep === "payment" || currentStep === "confirmation"
                      ? "bg-green-100"
                      : "bg-gray-100"
                }`}
              >
                {currentStep === "payment" || currentStep === "confirmation" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  "1"
                )}
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>

            <div
              className={`w-8 h-0.5 ${
                currentStep === "payment" || currentStep === "confirmation"
                  ? "bg-green-400"
                  : "bg-gray-300"
              }`}
            ></div>

            <div
              className={`flex items-center space-x-2 ${
                currentStep === "payment"
                  ? "text-cyan-600"
                  : currentStep === "confirmation"
                    ? "text-green-600"
                    : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === "payment"
                    ? "bg-cyan-100"
                    : currentStep === "confirmation"
                      ? "bg-green-100"
                      : "bg-gray-100"
                }`}
              >
                {currentStep === "confirmation" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  "2"
                )}
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>

            <div
              className={`w-8 h-0.5 ${
                currentStep === "confirmation" ? "bg-green-400" : "bg-gray-300"
              }`}
            ></div>

            <div
              className={`flex items-center space-x-2 ${
                currentStep === "confirmation" ? "text-green-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === "confirmation" ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                {currentStep === "confirmation" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  "3"
                )}
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentStep === "details" && renderCustomerDetails()}
          {currentStep === "payment" && renderPaymentStep()}
          {currentStep === "confirmation" && renderConfirmation()}
        </div>
      </div>

      <ShopClosedModal
        isOpen={showShopClosedModal}
        onClose={() => setShowShopClosedModal(false)}
        message={shopClosedMessage}
        workingHours={shopWorkingHours}
      />
    </div>
  );
};

export default CheckoutModal;