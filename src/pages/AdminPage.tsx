import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPageComponent from '../components/AdminPage';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return <AdminPageComponent onBackToHome={handleBackToHome} />;
};

export default AdminPage;