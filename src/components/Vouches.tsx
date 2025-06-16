import React, { useState, useEffect } from 'react';
import { Check, CheckCheck } from 'lucide-react';
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
              What Our Customers Say
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Real conversations from our satisfied gaming community
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
              What Our Customers Say
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Real conversations from our satisfied gaming community
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
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real conversations from our satisfied gaming community
          </p>
        </div>

        {/* Continuous Scrolling Testimonials */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex space-x-6 animate-scroll">
            {/* Duplicate testimonials for seamless loop */}
            {[...testimonials, ...testimonials].map((vouch, index) => (
              <div
                key={`${vouch.id}-${index}`}
                className="flex-shrink-0 w-96"
              >
                {/* WhatsApp Chat Interface */}
                <div className="bg-gradient-to-b from-green-500 to-green-600 rounded-t-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={vouch.avatar}
                      alt={vouch.name}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <div className="text-white">
                      <div className="font-semibold">{vouch.name}</div>
                      <div className="text-xs opacity-90">online</div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="bg-gray-100 p-6 rounded-b-2xl min-h-[200px] relative" 
                     style={{backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"chat-bg\" x=\"0\" y=\"0\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\"><circle cx=\"10\" cy=\"10\" r=\"1\" fill=\"%23e5e7eb\" opacity=\"0.3\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23chat-bg)\"/></svg>')"}}>
                  
                  {/* Customer Message */}
                  <div className="flex justify-end mb-4">
                    <div className="max-w-xs">
                      <div className="bg-green-500 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-md">
                        <p className="text-sm">{vouch.message}</p>
                      </div>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs text-gray-500">{vouch.time}</span>
                        <CheckCheck className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  </div>

                  {/* GameStore Reply */}
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-md border">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">GS</span>
                          </div>
                          <span className="text-xs font-semibold text-cyan-600">GameStore</span>
                        </div>
                        <p className="text-sm text-gray-700">{vouch.reply}</p>
                      </div>
                      <div className="flex items-center mt-1 space-x-1">
                        <span className="text-xs text-gray-500">Just now</span>
                        <Check className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
          animation: scroll 20s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default Vouches;