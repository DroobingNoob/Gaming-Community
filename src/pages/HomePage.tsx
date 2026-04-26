import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import TrustIndicators from '../components/TrustIndicators';
import Vouches from '../components/Vouches';
import BestSellers from '../components/BestSellers';
import Categories from '../components/Categories';
import Loader from '../components/Loader';
import { Game } from '../config/supabase';

interface HomePageProps {
  onNavigation: (section: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigation }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading for home page
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Show loader for 1.5 seconds on initial load

    return () => clearTimeout(timer);
  }, []);

  const handleGameClick = (game: Game) => {
    if (game.category === 'game') {
      navigate(`/games/${game.id}`);
    } else {
      navigate(`/subscriptions/${game.id}`);
    }
  };

  const handleViewAllGames = () => {
    navigate('/games');
  };

  const handleViewSubscriptions = () => {
    navigate('/subscriptions');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <Loader size="large" message="Welcome to Gaming Community!" fullScreen={true} />;
  }

  return (
    <>
      <Hero 
        onShopBestsellers={() => scrollToSection('bestsellers')} 
        onBrowseCategories={() => scrollToSection('categories')} 
      />
{/* WhatsApp Community CTA */}
<section className="px-4 sm:px-6 lg:px-8 mt-6">
  <div className="max-w-5xl mx-auto">
    <div className="relative overflow-hidden rounded-2xl border border-orange-200/70 bg-gradient-to-r from-white via-orange-50/80 to-red-50/70 p-4 sm:p-5 shadow-[0_10px_30px_rgba(249,115,22,0.12)] transition-all duration-300 hover:shadow-[0_14px_40px_rgba(249,115,22,0.18)]">
      
      {/* soft premium glow */}
      <div className="absolute -top-16 -right-12 h-32 w-32 rounded-full bg-orange-300/25 blur-3xl"></div>
      <div className="absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-red-300/20 blur-3xl"></div>

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
        
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-orange-100 px-3 py-1 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-70"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-orange-600">
                Exclusive discounts
              </span>
            </div>

            <span className="rounded-full bg-gray-900 text-white px-3 py-1 text-[11px] sm:text-xs font-semibold shadow-sm">
              1500+ members
            </span>
          </div>

          <h3 className="text-base sm:text-xl font-bold text-gray-950">
            Join our WhatsApp Community
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            New games, price drops and rental offers — all in one place.
          </p>
        </div>

        <div className="flex justify-center sm:justify-end">
          <a
            href="https://whatsapp.com/channel/0029Vaz3HzXBadmdfwWvXQ1A"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95"
          >
            Join Now
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

      </div>
    </div>
  </div>
</section>
      <TrustIndicators />
      <Vouches />
       <div id="categories">
        <Categories onViewAllGames={handleViewAllGames} onViewSubscriptions={handleViewSubscriptions} />
      </div> 
      <div id="bestsellers">
        <BestSellers onGameClick={handleGameClick} />
      </div>
     
    </>
  );
};

export default HomePage;