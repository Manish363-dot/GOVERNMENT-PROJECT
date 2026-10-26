import React from 'react';
import { AdminSignInPage } from './pages/AdminSignInPage';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

export const RentalAdminSignInPage: React.FC<{ initialRole?: 'admin' | 'user' }> = ({ initialRole = 'admin' }) => {
  return <AdminSignInPage initialRole={initialRole} />;
};

export default RentalAdminSignInPage;
