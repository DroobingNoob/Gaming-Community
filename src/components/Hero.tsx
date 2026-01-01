import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onShopBestsellers: () => void;
  onBrowseCategories: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShopBestsellers, onBrowseCategories }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const navigate = useNavigate();

  const goToNextSlide = () => {
  setCurrentSlide((prev) => (prev + 1) % slides.length);
};

const goToPrevSlide = () => {
  setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
};

const goToAllGames = () => {
 navigate('/games');
};


  // Auto-slide every 5 seconds
  useEffect(() => {
     if (isHovered) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const slides = [
    {
    title: "",
    subtitle: "",
    description: "",
    image: "/purple modern 11.11 50 discount instagram post (1024 x 768 mm)_20251203_125637_0000.jpg",
    overlay: "",
    buttonText: "",
    buttonAction: () => {},
    isBanner: true,
  },
    {
    title: "",
    subtitle: "",
    description: "",
    image: "/new90banner.jpg",
    overlay: "",
    buttonText: "",
    buttonAction: () => {},
    isBanner: true,
  },
     {
      title: "",
      subtitle: "",
      description: "",
      image: "/purple modern 11.11 50 discount instagram post (1024 x 768 mm)_20251203_215601_0000.jpg",
      overlay: "",
      buttonText: "",
      buttonAction: () => {},
      isBanner: true
    },
    {
      title: "🎮 PREMIUM GAMING 🎮",
      subtitle: "Best Games, Best Prices",
      description: "Experience the latest PS4 & PS5 titles at unbeatable prices",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
      overlay: "bg-gradient-to-br from-cyan-900/95 via-blue-900/90 to-cyan-900/85",
      buttonText: "Shop Now",
      buttonAction: onShopBestsellers,
      isBanner: false
    },

  ];

  const renderSlideContent = (slide: any) => {
    if (slide.isBanner) {
      return null;
    }

    return (
      <div className="text-white w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
       <h1 className="whitespace-nowrap text-center text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-black mb-2 xs:mb-3 sm:mb-4 md:mb-6 leading-tight tracking-tight">
  {slide.title}
</h1>

        <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-3 xs:mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent text-center drop-shadow-lg">
          {slide.subtitle}
        </div>

        <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 xs:mb-6 sm:mb-8 md:mb-10 opacity-95 leading-relaxed text-center max-w-2xl mx-auto">
          {slide.description}
        </p>

        {/* Action Buttons */}
{slide.buttonText && (
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
)}

      </div>
    );
  };

  return (
    <section className="relative h-64 xs:h-72 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] 2xl:h-[700px] overflow-hidden"
    onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
      >
      {slides.map((slide, index) => (

        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {slide.isBanner ? (
            <div className={`w-full h-full flex items-center justify-center ${
              slide.image.includes('purple modern') || slide.image.includes('215601')
                ? 'bg-black'
                : 'bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950'
            }`}>
              <img
                src={slide.image}
                alt="Banner"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className={`w-full h-full ${slide.overlay} flex items-center justify-center`}>
                <div className="container mx-auto px-2 sm:px-3 md:px-4 h-full flex items-center justify-center">
                  {renderSlideContent(slide)}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

   {/* Left Arrow */}
<button
  onClick={goToPrevSlide}
  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur text-white rounded-full p-1 sm:p-3 shadow-md transition"
  aria-label="Previous Slide"
>
  <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
</button>

{/* Right Arrow */}
<button
  onClick={goToNextSlide}
  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur text-white rounded-full p-1 sm:p-3 shadow-md transition"
  aria-label="Next Slide"
>
  <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
</button>


      {/* Slide-Specific Badges (hidden on mobile) */}
<div className="hidden sm:block">
  {/* Slide 3: Premium Gaming */}
  {currentSlide === 3 && (
    <>
      <div className="absolute top-2 sm:top-3 md:top-4 lg:top-6 xl:top-8 left-2 sm:left-3 md:left-4 lg:left-6 xl:left-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 rounded-full text-xs sm:text-sm md:text-base font-bold shadow-lg animate-pulse">
          🕹 BEST GAMES
        </div>
      </div>
      <div className="absolute top-2 sm:top-3 md:top-4 lg:top-6 xl:top-8 right-2 sm:right-3 md:right-4 lg:right-6 xl:right-8">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 rounded-full text-xs sm:text-sm md:text-base font-bold shadow-lg animate-bounce">
          💰 BEST PRICES
        </div>
      </div>
    </>
  )}
</div>


      {/* Slide Indicators */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
            }`}
          />
        ))}
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
