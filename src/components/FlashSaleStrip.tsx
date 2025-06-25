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
    <div className="fixed top-0 left-0 w-full z-[60] bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-yellow-300 font-bold shadow-md px-4 py-2">
     <div className="flash-strip-wrapper flex flex-wrap items-center justify-center gap-4 sm:gap-6 max-sm:gap-2 text-sm sm:text-base text-center sm:text-left">

        {/* Flash Sale Text */}
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 animate-pulse text-yellow-300" />
          <span className="font-extrabold tracking-wide whitespace-nowrap">
            🔥 FLASH SALE: 50% OFF
          </span>
        </div>

        {/* Timer */}
      <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1 font-mono text-sm max-sm:px-1.5 max-sm:py-0.5 max-sm:gap-1 max-sm:text-base">
  <Clock className="w-4 h-4 text-yellow-300 max-sm:w-3 max-sm:h-3" />
  <span>{format(timeLeft.hours)}</span>
  <span>:</span>
  <span>{format(timeLeft.minutes)}</span>
  <span>:</span>
  <span>{format(timeLeft.seconds)} </span>
</div>




        {/* Coupon */}
        <button
          onClick={handleCopyCoupon}
          className="flex items-center gap-2 border-2 border-dashed border-yellow-300 rounded-full px-4 py-1 hover:bg-yellow-300 hover:text-red-600 transition-colors"
        >
          <span className="font-mono text-xs sm:text-sm">GAMINGCOMMUNITY50</span>
          {copiedCoupon ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-yellow-300" />
          )}
        </button>

   
      </div>
      <div className="h-0.5 mt-2 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-pulse" />
    </div>
  );
};

export default FlashSaleStrip;