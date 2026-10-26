import React from 'react';
import { Navigate } from 'react-router-dom';

export const RentalRedirectGuard: React.FC = () => {
  return <Navigate to="/?rental=coming-soon" replace />;
};

export default RentalRedirectGuard;
