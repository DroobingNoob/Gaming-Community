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
<section className="px-4 sm:px-6 lg:px-8 mt-10">
  <div className="max-w-7xl mx-auto">
    <a
      href="https://whatsapp.com/channel/0029Vaz3HzXBadmdfwWvXQ1A"
      target="_blank"
      rel="noopener noreferrer"
      className="relative group block rounded-2xl overflow-hidden"
    >
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 blur-2xl group-hover:opacity-30 transition duration-500"></div>

      {/* Main card */}
      <div className="relative border border-orange-300/40 bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300">
        
        {/* Badge */}
        <span className="inline-block mb-3 text-xs font-semibold tracking-wide text-white bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full">
          🔥 LIMITED OFFERS INSIDE
        </span>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          
          {/* Text */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Join our WhatsApp Community
            </h3>

            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-xl">
              Get early access to new games, price drops, rental deals and exclusive discounts before anyone else.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
              Join Now →
            </div>
          </div>
        </div>
      </div>
    </a>
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