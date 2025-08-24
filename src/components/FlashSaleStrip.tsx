import React, { useState, useEffect } from "react";
import { Clock, Zap, X, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
 
const FlashSaleStrip: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(22, 0, 0, 0);
      if (now > target) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      return {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => n.toString().padStart(2, "0");

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("PLAY100");
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="sticky top-0 left-0 w-full z-[60] bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-yellow-300 font-bold shadow-lg px-4 py-2"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base">
            {/* Flash Sale Text */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-2"
            >
              <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white animate-pulse">
                🔥 FLASH SALE: ₹100 OFF
              </span>
            </motion.div>

            {/* Timer */}
            <div className="flex items-center gap-2 bg-black/40 rounded-full px-3 py-1 font-mono text-sm shadow-md">
              <Clock className="w-4 h-4 text-yellow-300" />
              <span className="text-yellow-100 drop-shadow-lg">
                {format(timeLeft.hours)}
              </span>
              <span>:</span>
              <span className="text-yellow-100 drop-shadow-lg">
                {format(timeLeft.minutes)}
              </span>
              <span>:</span>
              <span className="text-yellow-100 drop-shadow-lg">
                {format(timeLeft.seconds)}
              </span>
            </div>

            {/* Coupon */}
            <motion.button
              onClick={handleCopyCoupon}
              whileTap={{ scale: 0.9 }}
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-2 border-2 border-dashed border-yellow-300 rounded-full px-4 py-1 hover:bg-yellow-300 hover:text-red-600 transition-colors"
            >
              <span className="font-mono text-xs sm:text-sm">PLAY100</span>
              {copiedCoupon ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-yellow-300" />
              )}
            </motion.button>
          </div>

          {/* Animated underline */}
          <motion.div
            animate={{ scaleX: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-0.5 mt-2 bg-gradient-to-r from-yellow-400 via-white to-yellow-400"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlashSaleStrip;
