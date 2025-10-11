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
     
    </>
  );
};

export default HomePage;