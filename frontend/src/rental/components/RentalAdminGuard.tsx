import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

export const RentalAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isAdmin = Boolean(
    isAuthenticated &&
      user &&
      (user.role === 'SUPER_ADMIN' || user.role === 'SUB_ADMIN' || user.adminRole)
  );

  if (!isAdmin) {
    return (
      <Navigate
        to={`/rental/signin?role=admin&redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};
