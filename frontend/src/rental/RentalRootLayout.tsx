import React from 'react';
import { Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

export const RentalRootLayout: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default RentalRootLayout;
