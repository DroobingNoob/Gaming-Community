import React from "react";
import { Gift, Gamepad2 } from "lucide-react";

const FlashSaleStrip: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white py-3 overflow-hidden relative">
      <div className="absolute inset-0 bg-black opacity-10"></div>

      <div className="relative z-10 animate-marquee whitespace-nowrap flex items-center">
        <div className="inline-flex items-center space-x-8 px-4">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-lg">SPECIAL OFFER!</span>
          </div>

          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
            <Gift className="w-4 h-4" />
            <span className="font-semibold">Buy 2 Rent Games - Get Extra 10 Days FREE</span>
            <span className="bg-yellow-400 text-green-800 px-2 py-0.5 rounded-md font-bold text-sm">PLAY10MORE</span>
          </div>

          <span className="text-2xl">•</span>

          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
            <Gift className="w-4 h-4" />
            <span className="font-semibold">Buy 3 Rent Games - Get Extra 20 Days FREE</span>
            <span className="bg-yellow-400 text-green-800 px-2 py-0.5 rounded-md font-bold text-sm">PLAY20MORE</span>
          </div>

          <span className="text-2xl">•</span>

          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
            <span className="text-xl">❄️</span>
            <span className="font-semibold">Winter Sale: 10% OFF on orders above ₹1200</span>
            <span className="bg-blue-400 text-blue-900 px-2 py-0.5 rounded-md font-bold text-sm">WINTER10</span>
          </div>

          <span className="text-2xl">•</span>
        </div>

        <div className="inline-flex items-center space-x-8 px-4">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-lg">SPECIAL OFFER!</span>
          </div>

          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
            <Gift className="w-4 h-4" />
            <span className="font-semibold">Buy 2 Rent Games - Get Extra 10 Days FREE</span>
            <span className="bg-yellow-400 text-green-800 px-2 py-0.5 rounded-md font-bold text-sm">PLAY10MORE</span>
          </div>

          <span className="text-2xl">•</span>

          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
            <Gift className="w-4 h-4" />
            <span className="font-semibold">Buy 3 Rent Games - Get Extra 20 Days FREE</span>
            <span className="bg-yellow-400 text-green-800 px-2 py-0.5 rounded-md font-bold text-sm">PLAY20MORE</span>
          </div>

          <span className="text-2xl">•</span>

          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
            <span className="text-xl">❄️</span>
            <span className="font-semibold">Winter Sale: 10% OFF on orders above ₹1200</span>
            <span className="bg-blue-400 text-blue-900 px-2 py-0.5 rounded-md font-bold text-sm">WINTER10</span>
          </div>

          <span className="text-2xl">•</span>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 15s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default FlashSaleStrip;
