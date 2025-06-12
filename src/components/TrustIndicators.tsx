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
    <section className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {indicators.map((indicator, index) => (
            <div
              key={index}
              className="flex items-center justify-center space-x-4 text-center md:text-left"
            >
              <div className="text-cyan-400 flex-shrink-0">
                {indicator.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">
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