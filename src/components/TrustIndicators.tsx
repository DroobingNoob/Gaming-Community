import React from 'react';
import { Truck, Clock, Shield } from 'lucide-react';

const TrustIndicators: React.FC = () => {
  const indicators = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Instant Delivery",
      description: "Get your games immediately"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "24/7 Customer Support",
      description: "We're here to help anytime"
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Lowest Prices Guaranteed",
      description: "Best deals on the market"
    }
  ];

  return (
    <section className="bg-gradient-to-r from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {indicators.map((indicator, index) => (
            <div
              key={index}
              className="flex items-center justify-center space-x-4 text-center md:text-left bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-cyan-500 flex-shrink-0 bg-gradient-to-r from-cyan-100 to-blue-100 p-3 rounded-full">
                {indicator.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {indicator.title}
                </h3>
                <p className="text-gray-600 text-sm">
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