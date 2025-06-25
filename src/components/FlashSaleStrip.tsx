import React, { useState, useEffect } from 'react';
import { Clock, Zap, X, Copy, Check } from 'lucide-react';

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

  const format = (n: number) => n.toString().padStart(2, '0');

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('GAMINGCOMMUNITY50');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[60] bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-yellow-300 font-bold shadow-md px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
      <div className="flex flex-nowrap items-center justify-between gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
        {/* Flash Sale Text */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse text-yellow-300" />
          <span className="whitespace-nowrap font-semibold sm:font-bold">
            🔥 FLASH SALE: 50% OFF
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1 sm:gap-2 bg-black/30 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 font-mono text-[10px] sm:text-sm flex-shrink-0">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
          <span>{format(timeLeft.hours)}</span>
          <span>:</span>
          <span>{format(timeLeft.minutes)}</span>
          <span>:</span>
          <span>{format(timeLeft.seconds)}</span>
        </div>

        {/* Coupon */}
        <button
          onClick={handleCopyCoupon}
          className="flex items-center gap-1 sm:gap-2 border-2 border-dashed border-yellow-300 rounded-full px-2 sm:px-4 py-0.5 sm:py-1 hover:bg-yellow-300 hover:text-red-600 transition-colors flex-shrink-0"
        >
          <span className="font-mono text-[10px] sm:text-sm">GAMINGCOMMUNITY50</span>
          {copiedCoupon ? (
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
          ) : (
            <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
          )}
        </button>

        {/* Close */}
        <button
          onClick={() => setIsVisible(false)}
          className="text-yellow-300 hover:text-white transition flex-shrink-0"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="h-0.5 mt-1 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-pulse" />
    </div>
  );
};

export default FlashSaleStrip;
