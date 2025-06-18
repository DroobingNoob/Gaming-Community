import React from 'react';
import { useTestimonials } from '../hooks/useSupabaseData';

const CustomerScreenshots: React.FC = () => {
  const { testimonials, loading, error } = useTestimonials();

  if (loading) {
    return (
      <div className="py-8">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">Customer Screenshots</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading screenshots...</p>
        </div>
      </div>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <div className="py-8">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">Customer Screenshots</h3>
        <div className="text-center py-8">
          <p className="text-gray-600">No screenshots available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">Customer Screenshots</h3>
      
      {/* Phone Screenshots Display */}
      <div className="relative overflow-hidden">
        <div className="flex space-x-4 sm:space-x-6 animate-scroll-slow">
          {/* Duplicate screenshots for seamless loop */}
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
                      style={{ aspectRatio: '9/16' }} // Phone aspect ratio
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

      <style jsx>{`
        @keyframes scroll-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-slow {
          animation: scroll-slow 30s linear infinite;
        }
        
        .animate-scroll-slow:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default CustomerScreenshots;