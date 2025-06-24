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
      overlay: "bg-gradient-to-r from-orange-900/90 to-red-900/80",
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
      overlay: "bg-gradient-to-r from-purple-900/90 to-indigo-900/80",
      buttonText: "Claim Mystery Box",
      buttonAction: onBrowseCategories,
      isPromo: true
    },
    {
      id: 'regular',
      title: "Where low prices meet high entertainment",
      description: "Discover the best gaming deals on PS4 and PS5 titles. Instant delivery, guaranteed lowest prices.",
      image: "https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
      overlay: "bg-gradient-to-r from-cyan-900/80 to-orange-900/60",
      buttonText: "Browse Categories",
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
        <div className="text-white max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          {/* Promotional Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2 mb-3 sm:mb-4">
            {slide.id === 'flash-sale' ? (
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            ) : (
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            )}
            <span className="text-xs sm:text-sm font-bold">LIMITED TIME</span>
          </div>

          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 xs:mb-3 sm:mb-4 leading-tight">
            {slide.title}
          </h1>
          
          <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {slide.subtitle}
          </div>

          <p className="text-xs xs:text-sm sm:text-base md:text-lg mb-3 xs:mb-4 sm:mb-6 opacity-90 leading-relaxed">
            {slide.description}
          </p>

          {/* Countdown Timer - Only for flash sale */}
          {slide.id === 'flash-sale' && (
            <div className="bg-black/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="text-xs sm:text-sm font-bold text-yellow-400">ENDS IN</span>
              </div>
              <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white bg-red-600 rounded-lg px-2 sm:px-3 py-1 sm:py-2 min-w-[2.5rem] sm:min-w-[3rem]">
                    {formatTime(timeLeft.hours)}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 mt-1">HRS</div>
                </div>
                <div className="text-white text-lg sm:text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white bg-red-600 rounded-lg px-2 sm:px-3 py-1 sm:py-2 min-w-[2.5rem] sm:min-w-[3rem]">
                    {formatTime(timeLeft.minutes)}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 mt-1">MIN</div>
                </div>
                <div className="text-white text-lg sm:text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white bg-red-600 rounded-lg px-2 sm:px-3 py-1 sm:py-2 min-w-[2.5rem] sm:min-w-[3rem]">
                    {formatTime(timeLeft.seconds)}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 mt-1">SEC</div>
                </div>
              </div>
            </div>
          )}

          {/* Coupon Code */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border-2 border-dashed border-white/40">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-white/80 mb-1 sm:mb-2">USE COUPON CODE</div>
              <div className="text-lg sm:text-xl md:text-2xl font-black text-yellow-400 tracking-wider">
                {slide.couponCode}
              </div>
              <div className="text-xs sm:text-sm text-white/80 mt-1 sm:mt-2">
                {slide.id === 'mystery-box' ? 'For orders above ₹3000' : 'At checkout'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4">
            <button 
              onClick={slide.buttonAction}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-4 xs:px-5 sm:px-6 md:px-8 py-2.5 xs:py-3 sm:py-3 md:py-4 rounded-full font-bold text-xs xs:text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <Star className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              <span>{slide.buttonText}</span>
            </button>
            <button 
              onClick={onShopBestsellers}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-2 border-white/40 px-4 xs:px-5 sm:px-6 md:px-8 py-2.5 xs:py-3 sm:py-3 md:py-4 rounded-full font-semibold text-xs xs:text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105"
            >
              View Bestsellers
            </button>
          </div>
        </div>
      );
    } else {
      // Regular slide content
      return (
        <div className="text-white max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-2 xs:mb-3 sm:mb-4 md:mb-6 leading-tight">
            {slide.title}
          </h1>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl mb-3 xs:mb-4 sm:mb-6 md:mb-8 opacity-90 leading-relaxed">
            {slide.description}
          </p>
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4">
            <button 
              onClick={onShopBestsellers}
              className="bg-cyan-400 hover:bg-cyan-500 text-white px-3 xs:px-4 sm:px-6 md:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 rounded-full font-semibold text-xs xs:text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Shop Bestsellers
            </button>
            <button 
              onClick={slide.buttonAction}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 xs:px-4 sm:px-6 md:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 rounded-full font-semibold text-xs xs:text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {slide.buttonText}
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <section className="relative h-56 xs:h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className={`w-full h-full ${slide.overlay}`}>
              <div className="container mx-auto px-3 sm:px-4 h-full flex items-center">
                {renderSlideContent(slide)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-1 xs:left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1 xs:p-1.5 sm:p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronLeft className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-1 xs:right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1 xs:p-1.5 sm:p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
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