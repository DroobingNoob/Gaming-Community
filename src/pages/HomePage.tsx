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

      <TrustIndicators />
      <Vouches />
       <div id="categories">
        <Categories onViewAllGames={handleViewAllGames} onViewSubscriptions={handleViewSubscriptions} />
      </div> 
      <div id="bestsellers">
        <BestSellers onGameClick={handleGameClick} />
      </div>

     {/* WhatsApp Community CTA */}
<section className="px-4 sm:px-6 lg:px-8 mt-10 mb-10">
  <div className="max-w-5xl mx-auto">
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-black px-5 py-7 sm:px-8 sm:py-8 text-white shadow-2xl">
      
      <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-orange-500/25 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-red-500/20 blur-3xl" />

      <div className="relative flex flex-col items-center text-center gap-5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
            </span>
            Exclusive discounts
          </span>

          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            1500+ members
          </span>
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Join our Gaming Community
          </h3>

          <p className="mt-2 max-w-xl text-sm sm:text-base text-gray-300">
            Get early updates on new games, rental offers, price drops and community-only deals.
          </p>
        </div>

        <a
          href="https://whatsapp.com/channel/0029Vaz3HzXBadmdfwWvXQ1A"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-orange-500/40 active:scale-95"
        >
          Join WhatsApp Community
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>

        <p className="text-xs text-gray-400">
          No spam. Only useful game updates and offers.
        </p>
      </div>
    </div>
  </div>
</section>
     
    </>
  );
};

export default HomePage;