import React, { useState, useEffect } from 'react';
import { useTestimonials } from '../hooks/useSupabaseData';

const Vouches: React.FC = () => {
  const { testimonials, loading, error } = useTestimonials();
  const [currentVouch, setCurrentVouch] = useState(0);

  useEffect(() => {
    if (testimonials.length > 0) {
      const timer = setInterval(() => {
        setCurrentVouch((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [testimonials.length]);

  if (loading) {
    return (
      <section className="py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Customer Screenshots
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Real phone screenshots from our satisfied gaming community
            </p>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <section className="py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Customer Screenshots
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Real phone screenshots from our satisfied gaming community
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">No testimonials available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Customer Screenshots
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real phone screenshots from our satisfied gaming community
          </p>
        </div>

        {/* Continuous Scrolling Phone Screenshots */}
        <div className="relative max-w-7xl mx-auto">
          <div className="flex space-x-6 animate-scroll">
            {/* Duplicate testimonials for seamless loop */}
            {[...testimonials, ...testimonials].map((vouch, index) => (
              <div
                key={`${vouch.id}-${index}`}
                className="flex-shrink-0"
              >
                {/* Phone Screenshot Display */}
                <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl p-2 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  {/* Phone Frame */}
                  <div className="bg-black rounded-2xl p-1">
                    {/* Screenshot Image */}
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={vouch.image}
                        alt="Customer testimonial screenshot"
                        className="w-64 h-auto max-h-96 object-cover rounded-xl"
                        style={{ aspectRatio: '9/16' }} // Phone aspect ratio
                      />
                    </div>
                  </div>
                  
                  {/* Phone Details */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-cyan-50 to-orange-50 rounded-2xl p-8 max-w-2xl mx-auto border border-cyan-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Join Thousands of Happy Gamers! 🎮
            </h3>
            <p className="text-gray-600 mb-2">
              Game Smarter, Save Bigger
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default Vouches;