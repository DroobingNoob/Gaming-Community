import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  onShopBestsellers: () => void;
  onBrowseCategories: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShopBestsellers, onBrowseCategories }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "GTA V Premium Edition",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
      overlay: "bg-gradient-to-r from-cyan-900/80 to-orange-900/60"
    },
    {
      title: "Spider-Man 2",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
      overlay: "bg-gradient-to-r from-orange-900/80 to-cyan-900/60"
    },
    {
      title: "Call of Duty",
      image: "https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
      overlay: "bg-gradient-to-r from-cyan-900/80 to-orange-900/60"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
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
                <div className="text-white max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                  <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-2 xs:mb-3 sm:mb-4 md:mb-6 leading-tight">
                    Where low prices meet high entertainment
                  </h1>
                  <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl mb-3 xs:mb-4 sm:mb-6 md:mb-8 opacity-90 leading-relaxed">
                    Discover the best gaming deals on PS4 and PS5 titles. Instant delivery, guaranteed lowest prices.
                  </p>
                  <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4">
                    <button 
                      onClick={onShopBestsellers}
                      className="bg-cyan-400 hover:bg-cyan-500 text-white px-3 xs:px-4 sm:px-6 md:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 rounded-full font-semibold text-xs xs:text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Shop Bestsellers
                    </button>
                    <button 
                      onClick={onBrowseCategories}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 xs:px-4 sm:px-6 md:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 rounded-full font-semibold text-xs xs:text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Browse Categories
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-1 xs:left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1 xs:p-1.5 sm:p-2 rounded-full transition-all duration-300"
      >
        <ChevronLeft className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-1 xs:right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1 xs:p-1.5 sm:p-2 rounded-full transition-all duration-300"
      >
        <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-1 xs:bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;