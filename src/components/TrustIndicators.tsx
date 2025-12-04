import React from 'react';
import { Truck, Clock, Shield } from 'lucide-react';

const TrustIndicators: React.FC = () => {
  const indicators = [
    {
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
      title: "Fast Delivery",
      description: "Get your games within 30min - 4hours"
    },
    {
      icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
      title: "Customer Support",
      description: "We're here to help"
    },
    {
      icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
      title: "Lowest Prices Guaranteed",
      description: "Best deals on the market"
    }
  ];

  return (
    <section className="bg-gradient-to-r from-blue-50 to-orange-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {indicators.map((indicator, index) => (
            <div
              key={index}
              className="flex items-center justify-center space-x-3 sm:space-x-4 text-center sm:text-left bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-cyan-500 flex-shrink-0 bg-gradient-to-r from-cyan-100 to-blue-100 p-2 sm:p-2.5 md:p-3 rounded-full">
                {indicator.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg leading-tight">
                  {indicator.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-tight">
                  {indicator.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;