import React, { useState, useEffect } from 'react';
import { Clock, Zap, X, Copy, Check } from 'lucide-react';

const FlashSaleStrip: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const today = new Date();
      today.setHours(22, 0, 0, 0);
      if (now > today) today.setDate(today.getDate() + 1);
      const difference = today.getTime() - now.getTime();

      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }

      return { hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('GAMINGCOMMUNITY50');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 w-full z-[60] bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white shadow-lg">
      <div className="w-full px-2 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs sm:text-sm">
          {/* Left: Flash Icon & Text */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-yellow-400 p-1 rounded-full animate-pulse flex-shrink-0">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
            </div>
            <span className="font-bold tracking-wide whitespace-nowrap truncate max-w-[120px] sm:max-w-none">
              🔥 FLASH SALE 50% OFF
            </span>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-1 bg-black/20 rounded px-2 py-1 flex-shrink-0">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
            <div className="flex items-center gap-0.5 font-mono font-bold">
              <span>{formatTime(timeLeft.hours)}</span>
              <span>:</span>
              <span>{formatTime(timeLeft.minutes)}</span>
              <span>:</span>
              <span>{formatTime(timeLeft.seconds)}</span>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="flex items-center gap-1 bg-white/20 rounded px-3 py-1 flex-shrink-0">
            <span className="font-semibold">Code:</span>
            <button
              onClick={handleCopyCoupon}
              className="flex items-center gap-1 hover:bg-white/10 rounded px-2 py-0.5 transition-colors"
            >
              <span className="font-mono font-bold text-yellow-300">
                GAMINGCOMMUNITY50
              </span>
              {copiedCoupon ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-white/70" />
              )}
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Animated border */}
      <div className="h-0.5 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-pulse"></div>
    </div>
  );
};

export default FlashSaleStrip;
