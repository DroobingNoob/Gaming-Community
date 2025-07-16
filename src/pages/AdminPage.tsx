import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return <AdminPage onBackToHome={handleBackToHome} />;
};

export default AdminPage;