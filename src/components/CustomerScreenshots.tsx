import React, { useEffect, useRef, useState } from 'react';
import { useTestimonials } from '../hooks/useSupabaseData';
import Loader from './Loader';

const SCROLL_SPEED = 0.5; // pixels per frame

const CustomerScreenshots: React.FC = () => {
  const { testimonials, loading, error } = useTestimonials();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let animationFrameId: number;

    const scroll = () => {
      if (scrollRef.current && !isPaused) {
        scrollRef.current.scrollLeft += SCROLL_SPEED;

        const scrollWidth = scrollRef.current.scrollWidth;
        const containerWidth = scrollRef.current.clientWidth;

        if (scrollRef.current.scrollLeft >= scrollWidth / 2) {
          scrollRef.current.scrollLeft = 0;
        }
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  if (loading) {
    return (
      <div className="py-8">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">
          Customer Screenshots
        </h3>
        <Loader size="medium" message="Loading customer screenshots..." />
      </div>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <div className="py-8">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">
          Customer Screenshots
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-600">No screenshots available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">
        Customer Screenshots
      </h3>

      {/* Infinite Scroll Container */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="flex space-x-4 sm:space-x-6"
          style={{
            overflowX: 'scroll',
            scrollBehavior: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {[...testimonials, ...testimonials].map((screenshot, index) => (
            <div
              key={`${screenshot.id}-${index}`}
              className="flex-shrink-0"
            >
              {/* Phone Frame */}
              <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl transform hover:scale-105 transition-all duration-300">
                {/* Phone Screen */}
                <div className="bg-black rounded-xl sm:rounded-2xl p-0.5 sm:p-1">
                  {/* Screenshot Image */}
                  <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                    <img
                      src={screenshot.image}
                      alt="Customer screenshot"
                      className="w-32 sm:w-48 md:w-56 h-auto max-h-64 sm:max-h-80 md:max-h-96 object-cover rounded-lg sm:rounded-xl"
                      style={{ aspectRatio: '9/16' }}
                    />
                  </div>
                </div>

                {/* Phone Home Indicator */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 sm:w-12 h-0.5 sm:h-1 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8 sm:mt-12">
        <div className="bg-gradient-to-r from-cyan-50 to-orange-50 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto border border-cyan-100">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
            Join Thousands of Happy Gamers! 🎮
          </h4>
          <p className="text-gray-600 text-sm sm:text-base">
            Experience instant delivery and premium gaming at unbeatable prices
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerScreenshots;
