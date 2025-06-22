import React from 'react';
import Hero from '../components/Hero';
import TrustIndicators from '../components/TrustIndicators';
import Vouches from '../components/Vouches';
import BestSellers from '../components/BestSellers';
import Categories from '../components/Categories';
import { useNavigate } from 'react-router-dom';
import { Game } from '../config/supabase';

interface HomePageProps {
  onNavigation: (section: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigation }) => {
  const navigate = useNavigate();

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

  return (
    <>
      <Hero 
        onShopBestsellers={() => scrollToSection('bestsellers')} 
        onBrowseCategories={() => scrollToSection('categories')} 
      />
      <TrustIndicators />
      <Vouches />
      <div id="bestsellers">
        <BestSellers onGameClick={handleGameClick} />
      </div>
      <div id="categories">
        <Categories onViewAllGames={handleViewAllGames} onViewSubscriptions={handleViewSubscriptions} />
      </div>
    </>
  );
};

export default HomePage;