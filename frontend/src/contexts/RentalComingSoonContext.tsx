import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RentalComingSoonContextType {
  isOpen: boolean;
  openRentalComingSoon: () => void;
  closeRentalComingSoon: () => void;
}

const RentalComingSoonContext = createContext<RentalComingSoonContextType | undefined>(undefined);

export const RentalComingSoonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const openRentalComingSoon = useCallback(() => {
    navigate('/rental-portal');
  }, [navigate]);

  const closeRentalComingSoon = useCallback(() => {
    setIsOpen(false);
  }, []);

  // If URL has ?rental=coming-soon, redirect cleanly to /rental-portal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('rental') === 'coming-soon') {
      navigate('/rental-portal', { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <RentalComingSoonContext.Provider
      value={{
        isOpen,
        openRentalComingSoon,
        closeRentalComingSoon,
      }}
    >
      {children}
    </RentalComingSoonContext.Provider>
  );
};

export const useRentalComingSoon = () => {
  const context = useContext(RentalComingSoonContext);
  if (!context) {
    throw new Error('useRentalComingSoon must be used within a RentalComingSoonProvider');
  }
  return context;
};
