import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop: Automatically scrolls the window to the top on every route transition
 * unless an anchor hash (e.g. #notices) is present.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
}

