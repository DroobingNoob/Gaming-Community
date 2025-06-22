import React from 'react';
import { useNavigate } from 'react-router-dom';
import RefundPolicyPageComponent from '../components/RefundPolicyPage';

const RefundPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return <RefundPolicyPageComponent onBackToHome={handleBackToHome} />;
};

export default RefundPolicyPage;