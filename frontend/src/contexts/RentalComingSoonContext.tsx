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
    setIsOpen(true);
  }, []);

  const closeRentalComingSoon = useCallback(() => {
    setIsOpen(false);
    // If the URL had ?rental=coming-soon, clean it up
    if (location.search.includes('rental=coming-soon')) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete('rental');
      const newSearch = searchParams.toString();
      navigate(
        {
          pathname: location.pathname,
          search: newSearch ? `?${newSearch}` : '',
        },
        { replace: true }
      );
    }
  }, [location.pathname, location.search, navigate]);

  // If redirected with ?rental=coming-soon, automatically open modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('rental') === 'coming-soon') {
      setIsOpen(true);
    }
  }, [location.search]);

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
