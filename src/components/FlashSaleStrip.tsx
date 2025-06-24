import React, { useState, useEffect } from 'react';
import { Clock, Zap, X, Copy, Check } from 'lucide-react';

const FlashSaleStrip: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Calculate time until 10 PM today
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const today = new Date();
      today.setHours(22, 0, 0, 0); // 10 PM today
      
      // If it's already past 10 PM, set for 10 PM tomorrow
      if (now > today) {
        today.setDate(today.getDate() + 1);
      }
      
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
    <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white shadow-lg">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between py-2">
            {/* Flash Icon + Text */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="bg-yellow-400 p-1 rounded-full animate-pulse flex-shrink-0">
                <Zap className="w-3 h-3 text-red-600" />
              </div>
              <span className="text-xs font-bold tracking-wide truncate">
                🔥 FLASH SALE 50% OFF
              </span>
            </div>

            {/* Countdown */}
            <div className="flex items-center space-x-1 bg-black/20 rounded px-2 py-1 mx-2">
              <Clock className="w-3 h-3 text-yellow-400" />
              <div className="flex items-center space-x-0.5 text-xs font-mono font-bold">
                <span>{formatTime(timeLeft.hours)}</span>
                <span>:</span>
                <span>{formatTime(timeLeft.minutes)}</span>
                <span>:</span>
                <span>{formatTime(timeLeft.seconds)}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Second Row for Coupon Code on Mobile */}
          <div className="flex items-center justify-center pb-2">
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
              <span className="text-xs font-semibold">Code:</span>
              <button
                onClick={handleCopyCoupon}
                className="flex items-center space-x-1 hover:bg-white/10 rounded px-2 py-0.5 transition-colors"
              >
                <span className="text-xs font-mono font-bold text-yellow-300">
                  GAMINGCOMMUNITY50
                </span>
                {copiedCoupon ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-white/70" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop/Tablet Layout */}
        <div className="hidden sm:flex items-center justify-between py-2 md:py-3">
          {/* Flash Sale Content */}
          <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
            {/* Flash Icon */}
            <div className="flex-shrink-0">
              <div className="bg-yellow-400 p-1.5 rounded-full animate-pulse">
                <Zap className="w-4 h-4 text-red-600" />
              </div>
            </div>

            {/* Flash Sale Text */}
            <div className="flex-shrink-0">
              <span className="text-sm md:text-base font-bold tracking-wide">
                🔥 FLASH SALE: 50% OFF
              </span>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center space-x-2 bg-black/20 rounded-lg px-3 py-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              <div className="flex items-center space-x-1 text-sm font-mono font-bold">
                <span>{formatTime(timeLeft.hours)}</span>
                <span className="animate-pulse">:</span>
                <span>{formatTime(timeLeft.minutes)}</span>
                <span className="animate-pulse">:</span>
                <span>{formatTime(timeLeft.seconds)}</span>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1 min-w-0">
              <span className="text-sm font-semibold whitespace-nowrap">
                Code:
              </span>
              <button
                onClick={handleCopyCoupon}
                className="flex items-center space-x-1 hover:bg-white/10 rounded px-2 py-0.5 transition-colors"
              >
                <span className="text-sm font-mono font-bold text-yellow-300">
                  GAMINGCOMMUNITY50
                </span>
                {copiedCoupon ? (
                  <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-white/70 flex-shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Animated border */}
      <div className="h-0.5 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-pulse"></div>
    </div>
  );
};

export default FlashSaleStrip;