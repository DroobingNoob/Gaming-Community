import React from 'react';
import { useNavigate } from 'react-router-dom';
import FAQPageComponent from '../components/FAQPage';

const FAQPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return <FAQPageComponent onBackToHome={handleBackToHome} />;
};

export default FAQPage;