import React, { useState, useEffect } from 'react';
import { X, Percent } from 'lucide-react';

const FlashSaleStrip: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const today = new Date();
      today.setHours(22, 0, 0, 0);
      if (now > today) today.setDate(today.getDate() + 1);
      const difference = today.getTime() - now.getTime();

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, []);

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-[#6C3BFF] text-yellow-300 z-50 font-bold text-center text-sm sm:text-base px-4 py-3">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-6">
        {/* Main Title */}
        <div className="text-lg sm:text-xl font-extrabold tracking-wide">
          BIGGEST GAMING SALE
          <div className="text-xs sm:text-sm font-semibold">Sale ends in:</div>
        </div>

        {/* Timer */}
        <div className="flex items-end gap-3 sm:gap-4 font-mono text-lg sm:text-2xl">
          <div className="flex flex-col items-center">
            <span>{formatTime(timeLeft.hours)}</span>
            <span className="text-[10px] sm:text-xs font-semibold">HOURS</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold">:</span>
          <div className="flex flex-col items-center">
            <span>{formatTime(timeLeft.minutes)}</span>
            <span className="text-[10px] sm:text-xs font-semibold">MINUTES</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold">:</span>
          <div className="flex flex-col items-center">
            <span>{formatTime(timeLeft.seconds)}</span>
            <span className="text-[10px] sm:text-xs font-semibold">SECONDS</span>
          </div>
        </div>

        {/* Coupon */}
        <button
          className="flex items-center gap-2 border-2 border-dashed border-yellow-300 rounded-full px-4 py-1 text-sm sm:text-base hover:bg-yellow-300 hover:text-[#6C3BFF] transition"
          onClick={() => navigator.clipboard.writeText('SAVE10')}
        >
          <Percent className="w-4 h-4" />
          SAVE EXTRA 10%
        </button>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-3 text-yellow-300 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FlashSaleStrip;
