import React, { useState, useEffect } from 'react';
import { useTestimonials } from '../hooks/useSupabaseData';
import Loader from './Loader';

const Vouches: React.FC = () => {
  const { testimonials, loading, error } = useTestimonials();
  const [currentVouch, setCurrentVouch] = useState(0);

  useEffect(() => {
    if (testimonials.length > 0) {
      const timer = setInterval(() => {
        setCurrentVouch((prev) => (prev + 1) % testimonials.length);
      }, 3000); // Faster for mobile - 3 seconds instead of 4
      return () => clearInterval(timer);
    }
  }, [testimonials.length]);

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
              Customer Screenshots
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Real phone screenshots from our satisfied gaming community
            </p>
          </div>
          <Loader size="large" message="Loading customer testimonials..." />
        </div>
      </section>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
              Customer Screenshots
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Real phone screenshots from our satisfied gaming community
            </p>
          </div>
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-600">No testimonials available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
            Customer Screenshots
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Real phone screenshots from our satisfied gaming community
          </p>
        </div>

        {/* Continuous Scrolling Phone Screenshots */}
        <div className="relative max-w-7xl mx-auto">
          <div className="flex space-x-4 sm:space-x-6 animate-scroll-fast">
            {/* Duplicate testimonials for seamless loop */}
            {[...testimonials, ...testimonials].map((vouch, index) => (
              <div
                key={`${vouch.id}-${index}`}
                className="flex-shrink-0"
              >
                {/* Phone Screenshot Display */}
                <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  {/* Phone Frame */}
                  <div className="bg-black rounded-xl sm:rounded-2xl p-0.5 sm:p-1">
                    {/* Screenshot Image */}
                    <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                      <img
                        src={vouch.image}
                        alt="Customer testimonial screenshot"
                        className="w-48 sm:w-56 md:w-64 h-auto max-h-80 sm:max-h-96 md:max-h-[28rem] object-cover rounded-lg sm:rounded-xl"
                        style={{ aspectRatio: '9/16' }} // Phone aspect ratio
                      />
                    </div>
                  </div>
                  
                  {/* Phone Details */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 sm:w-16 h-0.5 sm:h-1 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8 sm:mt-12">
          <div className="bg-gradient-to-r from-cyan-50 to-orange-50 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto border border-cyan-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              Join Thousands of Happy Gamers! 🎮
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Game Smarter, Save Bigger
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-fast {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-fast {
          animation: scroll-fast 20s linear infinite;
        }
        
        .animate-scroll-fast:hover {
          animation-play-state: paused;
        }
        
        @media (max-width: 640px) {
          .animate-scroll-fast {
            animation: scroll-fast 15s linear infinite;
          }
        }
      `}</style>
    </section>
  );
};

export default Vouches;