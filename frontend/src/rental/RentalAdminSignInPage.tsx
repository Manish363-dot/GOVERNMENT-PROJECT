import React from 'react';
import { AdminSignInPage } from './pages/AdminSignInPage';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

export const RentalAdminSignInPage: React.FC<{ initialRole?: 'admin' | 'user' }> = ({ initialRole = 'admin' }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AdminSignInPage initialRole={initialRole} />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default RentalAdminSignInPage;
