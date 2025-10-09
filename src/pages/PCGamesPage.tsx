import React from 'react';
import { useNavigate } from 'react-router-dom';
import PCGamesPageComponent from '../components/PCGamesPage';
import { Game } from '../config/supabase';

const PCGamesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGameClick = (game: Game) => {
    navigate(`/games/${game.id}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <PCGamesPageComponent
      onGameClick={handleGameClick}
      onBackToHome={handleBackToHome}
    />
  );
};

export default PCGamesPage;
