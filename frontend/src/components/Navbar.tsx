import React from 'react';
import { useLocation } from 'react-router-dom';
import { NavbarLandingPage } from '@/landing-page/NavbarLandingPage';
import { NavbarSafaiPortal } from '@/swm/components/NavbarSafaiPortal';

export { NavbarLandingPage } from '@/landing-page/NavbarLandingPage';
export { NavbarSafaiPortal } from '@/swm/components/NavbarSafaiPortal';

/**
 * Smart Delegator Navbar:
 * Seamlessly delivers NavbarLandingPage on the main portal and
 * NavbarSafaiPortal on the dedicated Safai/SWM portal.
 */
export const Navbar = React.memo(() => {
  const location = useLocation();

  const isSafaiPortal = [
    '/safai-portal',
    '/swm',
    '/complaint',
    '/complaints',
    '/bylaws',
    '/cleanliness-bylaws',
    '/rules',
    '/swm-rules-2026',
    '/pledge',
    '/swachhata-pledge',
    '/daily-work',
    '/dailywork',
    '/waste-protocol',
    '/waste-segregation'
  ].some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

  if (isSafaiPortal) {
    return <NavbarSafaiPortal />;
  }

  return <NavbarLandingPage />;
});

Navbar.displayName = 'Navbar';
