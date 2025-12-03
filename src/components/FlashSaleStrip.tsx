import React, { useState, useEffect } from "react";
import { Clock, Copy, Check, Tag } from "lucide-react";
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
    navigator.clipboard.writeText("YEAREND25");
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sticky top-0 left-0 w-full z-[60] bg-black text-white shadow-2xl"
        >
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-orange-600/20 animate-pulse"></div>

            <div className="relative px-3 py-3 sm:py-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"> 
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="flex items-center gap-2"
                    >
                      <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                      <div className="flex flex-col">
                        <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-lg">
                          YEAR END SALE
                        </span>
                        <span className="text-xs sm:text-sm text-orange-400 font-semibold">
                          10% OFF (Max ₹200) on orders ₹1000+
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg px-3 py-2 shadow-lg">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <div className="flex items-center gap-1 font-mono text-base sm:text-lg font-bold">
                        <span className="text-white">{format(timeLeft.hours)}</span>
                        <span className="text-orange-200">:</span>
                        <span className="text-white">{format(timeLeft.minutes)}</span>
                        <span className="text-orange-200">:</span>
                        <span className="text-white">{format(timeLeft.seconds)}</span>
                      </div>
                    </div>

                    <motion.button
                      onClick={handleCopyCoupon}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
                      <div className="relative flex items-center gap-2 bg-white text-black rounded-lg px-4 py-2 font-bold border-2 border-dashed border-orange-500">
                        <span className="text-sm sm:text-base font-mono tracking-wider">YEAREND25</span>
                        {copiedCoupon ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="h-1 bg-gradient-to-r from-orange-500 via-red-600 via-orange-500 to-red-600 bg-[length:200%_100%]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlashSaleStrip;
  