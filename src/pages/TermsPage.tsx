import React from 'react';
import { useNavigate } from 'react-router-dom';
import TermsPageComponent from '../components/TermsPage';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return <TermsPageComponent onBackToHome={handleBackToHome} />;
};

export default TermsPage;