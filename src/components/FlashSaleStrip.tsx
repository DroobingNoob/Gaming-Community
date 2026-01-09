import React from "react";
import { Gift, Sparkles } from "lucide-react";

const FlashSaleStrip: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white py-4 shadow-lg">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
      </div>

      {/* Decorative circles */}
      <div className="absolute top-0 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-6">
          {/* Header */}
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-lg">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="font-bold text-base sm:text-lg tracking-wide">SPECIAL OFFERS</span>
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>

          <span className="text-white/50 text-2xl hidden lg:block">|</span>

          {/* Offer 1 */}
          <div className="group flex items-center space-x-2 bg-gradient-to-r from-white/25 to-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <Gift className="w-4 h-4 text-yellow-300 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold text-sm sm:text-base">Buy 2 Games</span>
            <span className="text-yellow-300 font-bold hidden sm:inline">→</span>
            <span className="font-bold text-sm sm:text-base text-yellow-300">+10 Days FREE</span>
            <span className="bg-gradient-to-r from-yellow-400 to-amber-400 text-emerald-900 px-3 py-1 rounded-full font-bold text-xs shadow-md">
              PLAY10MORE
            </span>
          </div>

          <span className="text-white/50 text-2xl hidden lg:block">|</span>

          {/* Offer 2 */}
          <div className="group flex items-center space-x-2 bg-gradient-to-r from-white/25 to-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <Gift className="w-4 h-4 text-yellow-300 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold text-sm sm:text-base">Buy 3 Games</span>
            <span className="text-yellow-300 font-bold hidden sm:inline">→</span>
            <span className="font-bold text-sm sm:text-base text-yellow-300">+20 Days FREE</span>
            <span className="bg-gradient-to-r from-yellow-400 to-amber-400 text-emerald-900 px-3 py-1 rounded-full font-bold text-xs shadow-md">
              PLAY20MORE
            </span>
          </div>

          <span className="text-white/50 text-2xl hidden lg:block">|</span>

          {/* Offer 3 */}
          <div className="group flex items-center space-x-2 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-300/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <span className="text-xl group-hover:scale-110 transition-transform duration-300">❄️</span>
            <span className="font-semibold text-sm sm:text-base">Winter Sale</span>
            <span className="text-cyan-200 font-bold hidden sm:inline">→</span>
            <span className="font-bold text-sm sm:text-base text-cyan-200">10% OFF ₹1200+</span>
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 text-blue-900 px-3 py-1 rounded-full font-bold text-xs shadow-md">
              WINTER10
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default FlashSaleStrip;
