import React from "react";
import { Gift, Gamepad2 } from "lucide-react";

const FlashSaleStrip: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white py-3 relative">
      <div className="absolute inset-0 bg-black opacity-10"></div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex items-center justify-center flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-lg">SPECIAL OFFERS!</span>
          </div>

          <span className="text-2xl hidden sm:block">•</span>

          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
            <Gift className="w-4 h-4" />
            <span className="font-semibold text-sm sm:text-base">Buy 2 Rent Games - Get Extra 10 Days FREE</span>
            <span className="bg-yellow-400 text-green-800 px-2 py-0.5 rounded-md font-bold text-sm">PLAY10MORE</span>
          </div>

          <span className="text-2xl hidden sm:block">•</span>

          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
            <Gift className="w-4 h-4" />
            <span className="font-semibold text-sm sm:text-base">Buy 3 Rent Games - Get Extra 20 Days FREE</span>
            <span className="bg-yellow-400 text-green-800 px-2 py-0.5 rounded-md font-bold text-sm">PLAY20MORE</span>
          </div>

          <span className="text-2xl hidden sm:block">•</span>

          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
            <span className="text-xl">❄️</span>
            <span className="font-semibold text-sm sm:text-base">Winter Sale: 10% OFF on orders above ₹1200</span>
            <span className="bg-blue-400 text-blue-900 px-2 py-0.5 rounded-md font-bold text-sm">WINTER10</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleStrip;
