import React, { useState, useEffect } from 'react';
import { Clock, Gift, Zap, Star, Trophy } from 'lucide-react';

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
      <div className="text-white w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Promotional Badge */}
        <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 mb-3 sm:mb-4 md:mb-6 shadow-lg">
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-yellow-400" />
          <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-wide">LIMITED TIME ONLY</span>
        </div>

        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-2 xs:mb-3 sm:mb-4 md:mb-6 leading-tight text-center">
          {slide.title}
        </h1>
        
        <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-3 xs:mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent text-center drop-shadow-lg">
          {slide.subtitle}
        </div>

        <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 xs:mb-6 sm:mb-8 md:mb-10 opacity-95 leading-relaxed text-center max-w-2xl mx-auto">
          {slide.description}
        </p>

        {/* Mystery Box Deal - NEW ADDITION */}
        <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-md rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 lg:mb-10 border-2 border-purple-400/50 shadow-2xl max-w-lg mx-auto">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-3 md:mb-4">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-purple-400" />
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-purple-300 tracking-wider">MYSTERY BOX DEAL</span>
          </div>
          <div className="text-center">
            <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3">
              First 30 Orders Above ₹3000
            </div>
            <div className="text-xs xs:text-sm sm:text-base md:text-lg text-purple-200 mb-2 sm:mb-3">
              Get a <span className="text-yellow-300 font-bold">FREE Mystery Game</span> (1 Month Rent)
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-purple-300/50">
              <div className="text-xs sm:text-sm text-purple-200 mb-1">Use Coupon Code:</div>
              <div className="text-sm xs:text-base sm:text-lg md:text-xl font-mono font-bold text-yellow-300 tracking-wider">
                MYSTERYBOX
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 lg:mb-10 border border-white/20 shadow-2xl max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-3 mb-2 sm:mb-3 md:mb-4">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-yellow-400" />
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-yellow-400 tracking-wider">ENDS IN</span>
          </div>
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6">
            <div className="text-center">
              <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white bg-gradient-to-b from-red-500 to-red-700 rounded-lg sm:rounded-xl px-2 xs:px-3 sm:px-4 py-1 xs:py-2 sm:py-3 min-w-[2.5rem] xs:min-w-[3rem] sm:min-w-[4rem] shadow-lg">
                {formatTime(timeLeft.hours)}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-yellow-300 mt-1 sm:mt-2 font-semibold">HRS</div>
            </div>
            <div className="text-white text-lg xs:text-xl sm:text-2xl md:text-3xl font-black">:</div>
            <div className="text-center">
              <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white bg-gradient-to-b from-red-500 to-red-700 rounded-lg sm:rounded-xl px-2 xs:px-3 sm:px-4 py-1 xs:py-2 sm:py-3 min-w-[2.5rem] xs:min-w-[3rem] sm:min-w-[4rem] shadow-lg">
                {formatTime(timeLeft.minutes)}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-yellow-300 mt-1 sm:mt-2 font-semibold">MIN</div>
            </div>
            <div className="text-white text-lg xs:text-xl sm:text-2xl md:text-3xl font-black">:</div>
            <div className="text-center">
              <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white bg-gradient-to-b from-red-500 to-red-700 rounded-lg sm:rounded-xl px-2 xs:px-3 sm:px-4 py-1 xs:py-2 sm:py-3 min-w-[2.5rem] xs:min-w-[3rem] sm:min-w-[4rem] shadow-lg">
                {formatTime(timeLeft.seconds)}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-yellow-300 mt-1 sm:mt-2 font-semibold">SEC</div>
            </div>
          </div>
        </div>

        {/* Coupon Code */}
        <div className="bg-white/25 backdrop-blur-md rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 lg:mb-10 border-2 border-dashed border-white/50 shadow-2xl max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          <div className="text-center">
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 mb-1 sm:mb-2 md:mb-3 font-semibold tracking-wide">USE COUPON CODE</div>
            <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-yellow-300 tracking-wider drop-shadow-lg break-all">
              {slide.couponCode}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-white/90 mt-1 sm:mt-2 md:mt-3 font-medium">
              At checkout
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 max-w-xs sm:max-w-sm md:max-w-lg mx-auto">
          <button 
            onClick={slide.buttonAction}
            className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-black px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-full font-black text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-3"
          >
            <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            <span className="truncate">{slide.buttonText}</span>
          </button>
          <button 
            onClick={onBrowseCategories}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-2 border-white/50 px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-full font-bold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            Browse Categories
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="relative h-64 xs:h-72 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] 2xl:h-[700px] overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className={`w-full h-full ${slide.overlay} flex items-center justify-center`}>
            <div className="container mx-auto px-2 sm:px-3 md:px-4 h-full flex items-center justify-center">
              {renderSlideContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Badge */}
      <div className="absolute top-2 sm:top-3 md:top-4 lg:top-6 xl:top-8 left-2 sm:left-3 md:left-4 lg:left-6 xl:left-8">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 rounded-full text-xs sm:text-sm md:text-base font-bold shadow-lg animate-pulse">
          🔥 FLASH SALE
        </div>
      </div>

      {/* Mystery Box Badge */}
      <div className="absolute top-2 sm:top-3 md:top-4 lg:top-6 xl:top-8 right-2 sm:right-3 md:right-4 lg:right-6 xl:right-8">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 rounded-full text-xs sm:text-sm md:text-base font-bold shadow-lg animate-bounce">
          🎁 MYSTERY BOX
        </div>
      </div>

      {/* Floating elements for visual appeal */}
      <div className="absolute top-1/4 right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 animate-bounce-slow opacity-20">
        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-yellow-400 rounded-full"></div>
      </div>
      <div className="absolute bottom-1/4 left-4 sm:left-6 md:left-8 lg:left-12 xl:left-16 animate-bounce-slow opacity-20" style={{ animationDelay: '1s' }}>
        <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-orange-400 rounded-full"></div>
      </div>
    </section>
  );
};

export default Hero;