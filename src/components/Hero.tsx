import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Gift, Zap, Star } from 'lucide-react';

interface HeroProps {
  onShopBestsellers: () => void;
  onBrowseCategories: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShopBestsellers, onBrowseCategories }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
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
  
  const slides = [
    {
      id: 'flash-sale',
      title: "🔥 FLASH SALE ALERT! 🔥",
      subtitle: "50% OFF ALL GAMES",
      description: "Limited time offer! Use coupon code at checkout",
      couponCode: "GAMINGCOMMUNITY50",
      timeLeft: timeLeft,
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
      overlay: "bg-gradient-to-br from-orange-900/95 via-red-900/90 to-pink-900/85",
      buttonText: "Shop Now & Save 50%",
      buttonAction: onShopBestsellers,
      isPromo: true
    },
    {
      id: 'mystery-box',
      title: "🎁 MYSTERY BOX PROMO 🎁",
      subtitle: "FREE Mystery Game",
      description: "First 30 orders above ₹3000 get a FREE mystery game rental!",
      couponCode: "MYSTERYBOX",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
      overlay: "bg-gradient-to-br from-purple-900/95 via-indigo-900/90 to-blue-900/85",
      buttonText: "Claim Mystery Box",
      buttonAction: onBrowseCategories,
      isPromo: true
    },
    {
      id: 'regular',
      title: "Where Gaming Dreams Come True",
      subtitle: "Premium Games, Unbeatable Prices",
      description: "Discover the ultimate gaming experience with instant delivery and guaranteed lowest prices on PS4 and PS5 titles.",
      image: "https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
      overlay: "bg-gradient-to-br from-cyan-900/90 via-blue-900/85 to-indigo-900/80",
      buttonText: "Explore Games",
      buttonAction: onBrowseCategories,
      isPromo: false
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Slower transition for promos
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const renderSlideContent = (slide: any) => {
    if (slide.isPromo) {
      return (
        <div className="text-white w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto px-4 sm:px-0">
          {/* Promotional Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4 shadow-lg">
            {slide.id === 'flash-sale' ? (
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" />
            ) : (
              <Gift className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-400" />
            )}
            <span className="text-xs sm:text-sm font-bold tracking-wide">LIMITED TIME</span>
          </div>

          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-2 xs:mb-3 sm:mb-4 leading-tight text-center sm:text-left">
            {slide.title}
          </h1>
          
          <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent text-center sm:text-left drop-shadow-lg">
            {slide.subtitle}
          </div>

          <p className="text-xs xs:text-sm sm:text-base md:text-lg mb-4 xs:mb-5 sm:mb-6 opacity-95 leading-relaxed text-center sm:text-left">
            {slide.description}
          </p>

          {/* Countdown Timer - Only for flash sale */}
          {slide.id === 'flash-sale' && (
            <div className="bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="text-xs sm:text-sm font-bold text-yellow-400 tracking-wider">ENDS IN</span>
              </div>
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4">
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white bg-gradient-to-b from-red-500 to-red-700 rounded-lg px-2 sm:px-3 py-1 sm:py-2 min-w-[2.5rem] sm:min-w-[3rem] shadow-lg">
                    {formatTime(timeLeft.hours)}
                  </div>
                  <div className="text-xs sm:text-sm text-yellow-300 mt-1 font-semibold">HRS</div>
                </div>
                <div className="text-white text-lg sm:text-xl md:text-2xl font-black">:</div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white bg-gradient-to-b from-red-500 to-red-700 rounded-lg px-2 sm:px-3 py-1 sm:py-2 min-w-[2.5rem] sm:min-w-[3rem] shadow-lg">
                    {formatTime(timeLeft.minutes)}
                  </div>
                  <div className="text-xs sm:text-sm text-yellow-300 mt-1 font-semibold">MIN</div>
                </div>
                <div className="text-white text-lg sm:text-xl md:text-2xl font-black">:</div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white bg-gradient-to-b from-red-500 to-red-700 rounded-lg px-2 sm:px-3 py-1 sm:py-2 min-w-[2.5rem] sm:min-w-[3rem] shadow-lg">
                    {formatTime(timeLeft.seconds)}
                  </div>
                  <div className="text-xs sm:text-sm text-yellow-300 mt-1 font-semibold">SEC</div>
                </div>
              </div>
            </div>
          )}

          {/* Coupon Code */}
          <div className="bg-white/25 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 border-2 border-dashed border-white/50 shadow-2xl">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-white/90 mb-2 font-semibold tracking-wide">USE COUPON CODE</div>
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-yellow-300 tracking-wider drop-shadow-lg">
                {slide.couponCode}
              </div>
              <div className="text-xs sm:text-sm text-white/90 mt-2 font-medium">
                {slide.id === 'mystery-box' ? 'For orders above ₹3000' : 'At checkout'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 sm:gap-4">
            <button 
              onClick={slide.buttonAction}
              className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-black px-4 xs:px-5 sm:px-6 md:px-8 py-3 xs:py-3.5 sm:py-4 rounded-full font-black text-xs xs:text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-2"
            >
              <Star className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              <span>{slide.buttonText}</span>
            </button>
            <button 
              onClick={onShopBestsellers}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-2 border-white/50 px-4 xs:px-5 sm:px-6 md:px-8 py-3 xs:py-3.5 sm:py-4 rounded-full font-bold text-xs xs:text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              View Bestsellers
            </button>
          </div>
        </div>
      );
    } else {
      // Regular slide content
      return (
        <div className="text-white w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto px-4 sm:px-0">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-3 xs:mb-4 sm:mb-6 leading-tight text-center sm:text-left">
            {slide.title}
          </h1>
          
          {slide.subtitle && (
            <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 xs:mb-4 sm:mb-5 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent text-center sm:text-left">
              {slide.subtitle}
            </div>
          )}
          
          <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl mb-4 xs:mb-5 sm:mb-8 opacity-95 leading-relaxed text-center sm:text-left">
            {slide.description}
          </p>
          
          <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 sm:gap-4">
            <button 
              onClick={onShopBestsellers}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 xs:px-5 sm:px-6 md:px-8 py-3 xs:py-3.5 sm:py-4 rounded-full font-bold text-xs xs:text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Shop Bestsellers
            </button>
            <button 
              onClick={slide.buttonAction}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 xs:px-5 sm:px-6 md:px-8 py-3 xs:py-3.5 sm:py-4 rounded-full font-bold text-xs xs:text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              {slide.buttonText}
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <section className="relative h-64 xs:h-72 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className={`w-full h-full ${slide.overlay} flex items-center justify-center`}>
              <div className="container mx-auto px-3 sm:px-4 h-full flex items-center justify-center">
                {renderSlideContent(slide)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 xs:left-3 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 xs:p-2.5 sm:p-3 rounded-full transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl"
      >
        <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 xs:right-3 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 xs:p-2.5 sm:p-3 rounded-full transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl"
      >
        <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 xs:bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 shadow-lg ${
              index === currentSlide 
                ? 'bg-white scale-125 shadow-white/50' 
                : 'bg-white/60 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Promotional Badge for current slide */}
      {slides[currentSlide].isPromo && (
        <div className="absolute top-3 xs:top-4 sm:top-6 left-3 xs:left-4 sm:left-6">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-full text-xs xs:text-sm sm:text-base font-bold shadow-lg animate-pulse">
            {slides[currentSlide].id === 'flash-sale' ? '🔥 FLASH SALE' : '🎁 MYSTERY BOX'}
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;