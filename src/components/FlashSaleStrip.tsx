import React from "react";
import { Gift } from "lucide-react";

const FlashSaleStrip: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-3 shadow-md">
      {/* Subtle shimmer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
      </div>

      <div className="relative z-10 w-full overflow-hidden">
        {/* Scrolling Track */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          <MarqueeContent />
          <MarqueeContent /> {/* duplicate for seamless loop */}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 25s linear infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-shimmer {
          animation: shimmer 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FlashSaleStrip;

/* ---------------- Sub Components ---------------- */

const MarqueeContent = () => (
  <div className="flex items-center gap-x-6 px-4 text-sm sm:text-base">
    <Title />
    <Separator />
    <Offer title="Buy 2 Games" benefit="+10 Days Free" code="PLAY10MORE" />
    <Separator />
    <Offer title="Buy 3 Games" benefit="+20 Days Free" code="PLAY20MORE" />
    <Separator />
    <Offer
      title="Winter Sale"
      benefit="10% OFF ₹1200+"
      code="WINTER10"
      accent="blue"
    />
    <Separator />
  </div>
);

const Title = () => (
  <div className="flex items-center gap-2 font-semibold uppercase tracking-wide text-white/90">
    <span className="h-2 w-2 rounded-full bg-yellow-300" />
    Limited-Time Offers
  </div>
);

const Separator = () => (
  <span className="hidden lg:block text-white/30">|</span>
);

interface OfferProps {
  title: string;
  benefit: string;
  code: string;
  accent?: "blue";
}

const Offer: React.FC<OfferProps> = ({ title, benefit, code, accent }) => {
  const badgeStyle =
    accent === "blue"
      ? "bg-blue-100 text-blue-900"
      : "bg-yellow-100 text-emerald-900";

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 backdrop-blur-sm transition hover:bg-white/15">
      <Gift className="h-4 w-4 text-yellow-300" />
      <span className="font-medium text-white/90">{title}</span>
      <span className="text-white/50">→</span>
      <span className="font-semibold text-white">{benefit}</span>
      <span
        className={`ml-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeStyle}`}
      >
        {code}
      </span>
    </div>
  );
};
