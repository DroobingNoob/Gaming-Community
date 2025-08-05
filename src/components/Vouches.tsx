import React from 'react';
import { useTestimonials } from '../hooks/useSupabaseData';
import Loader from './Loader';

const Vouches: React.FC = () => {
  const { testimonials, loading, error } = useTestimonials();

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Customer Screenshots
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
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
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Customer Screenshots
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Real phone screenshots from our satisfied gaming community
            </p>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600">No testimonials available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Customer Screenshots
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Real phone screenshots from our satisfied gaming community
          </p>
        </div>

        {/* Infinite Scrolling Section */}
        <div className="relative max-w-7xl mx-auto overflow-hidden">
          <div className="flex space-x-4 sm:space-x-6 animate-scroll-fast w-max">
            {/* Duplicate testimonials for seamless scroll */}
            {[...testimonials, ...testimonials].map((vouch, index) => (
              <div key={`${vouch.id ?? index}-${index}`} className="flex-shrink-0">
                <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="bg-black rounded-xl sm:rounded-2xl p-0.5 sm:p-1">
                    <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                      <img
                        src={vouch.image}
                        alt="Customer testimonial screenshot"
                        className="w-48 sm:w-56 md:w-64 h-auto max-h-80 sm:max-h-96 md:max-h-[28rem] object-cover rounded-lg sm:rounded-xl"
                        style={{ aspectRatio: '9/16' }}
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 sm:w-16 h-0.5 sm:h-1 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <div className="bg-gradient-to-r from-cyan-50 to-orange-50 rounded-2xl p-6 max-w-2xl mx-auto border border-cyan-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
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
          animation: scroll-fast 30s linear infinite;
        }

        .animate-scroll-fast:hover {
          animation-play-state: paused;
        }

        @media (max-width: 640px) {
          .animate-scroll-fast {
            animation-duration: 20s;
          }
        }
      `}</style>
    </section>
  );
};

export default Vouches;
 