import React, { useState, useEffect } from 'react';
import { Clock, Gift, Zap, Star } from 'lucide-react';

interface HeroProps {
  onShopBestsellers: () => void;
  onBrowseCategories: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShopBestsellers, onBrowseCategories }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

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

  // Single slide content
  const slide = {
    id: 'flash-sale',
    title: "🔥 MEGA FLASH SALE! 🔥",
    subtitle: "50% OFF ALL GAMES",
    description: "Limited time offer! Use coupon code at checkout",
    couponCode: "GAMINGCOMMUNITY50",
    timeLeft: timeLeft,
    image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
    overlay: "bg-gradient-to-br from-orange-900/95 via-red-900/90 to-pink-900/85",
    buttonText: "Shop Now & Save 50%",
    buttonAction: onShopBestsellers,
    isPromo: true
  };

  const renderSlideContent = () => {
    return (
      <div className="text-white w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Promotional Badge */}
        <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 shadow-lg">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-400" />
          <span className="text-sm sm:text-base md:text-lg font-bold tracking-wide">LIMITED TIME ONLY</span>
        </div>

        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-3 xs:mb-4 sm:mb-6 leading-tight text-center">
          {slide.title}
        </h1>
        
        <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 xs:mb-5 sm:mb-8 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent text-center drop-shadow-lg">
          {slide.subtitle}
        </div>

        <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl mb-6 xs:mb-8 sm:mb-10 opacity-95 leading-relaxed text-center max-w-2xl mx-auto">
          {slide.description}
        </p>

        {/* Countdown Timer */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-10 border border-white/20 shadow-2xl max-w-lg mx-auto">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-400" />
            <span className="text-sm sm:text-base md:text-lg font-bold text-yellow-400 tracking-wider">ENDS IN</span>
          </div>
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 md:space-x-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white bg-gradient-to-b from-red-500 to-red-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 min-w-[3rem] sm:min-w-[4rem] shadow-lg">
                {formatTime(timeLeft.hours)}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-yellow-300 mt-1 sm:mt-2 font-semibold">HRS</div>
            </div>
            <div className="text-white text-xl sm:text-2xl md:text-3xl font-black">:</div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white bg-gradient-to-b from-red-500 to-red-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 min-w-[3rem] sm:min-w-[4rem] shadow-lg">
                {formatTime(timeLeft.minutes)}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-yellow-300 mt-1 sm:mt-2 font-semibold">MIN</div>
            </div>
            <div className="text-white text-xl sm:text-2xl md:text-3xl font-black">:</div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white bg-gradient-to-b from-red-500 to-red-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 min-w-[3rem] sm:min-w-[4rem] shadow-lg">
                {formatTime(timeLeft.seconds)}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-yellow-300 mt-1 sm:mt-2 font-semibold">SEC</div>
            </div>
          </div>
        </div>

        {/* Coupon Code */}
        <div className="bg-white/25 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-10 border-2 border-dashed border-white/50 shadow-2xl max-w-md mx-auto">
          <div className="text-center">
            <div className="text-sm sm:text-base md:text-lg text-white/90 mb-2 sm:mb-3 font-semibold tracking-wide">USE COUPON CODE</div>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-yellow-300 tracking-wider drop-shadow-lg">
              {slide.couponCode}
            </div>
            <div className="text-sm sm:text-base text-white/90 mt-2 sm:mt-3 font-medium">
              At checkout
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-lg mx-auto">
          <button 
            onClick={slide.buttonAction}
            className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-black px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-black text-sm sm:text-base md:text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-2 sm:space-x-3"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span>{slide.buttonText}</span>
          </button>
          <button 
            onClick={onBrowseCategories}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-2 border-white/50 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-bold text-sm sm:text-base md:text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            Browse Categories
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="relative h-80 sm:h-96 md:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className={`w-full h-full ${slide.overlay} flex items-center justify-center`}>
            <div className="container mx-auto px-3 sm:px-4 h-full flex items-center justify-center">
              {renderSlideContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Badge */}
      <div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-bold shadow-lg animate-pulse">
          🔥 FLASH SALE
        </div>
      </div>

      {/* Floating elements for visual appeal */}
      <div className="absolute top-1/4 right-8 sm:right-12 md:right-16 animate-bounce-slow opacity-20">
        <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-yellow-400 rounded-full"></div>
      </div>
      <div className="absolute bottom-1/4 left-8 sm:left-12 md:left-16 animate-bounce-slow opacity-20" style={{ animationDelay: '1s' }}>
        <div className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-400 rounded-full"></div>
      </div>
    </section>
  );
};

export default Hero;