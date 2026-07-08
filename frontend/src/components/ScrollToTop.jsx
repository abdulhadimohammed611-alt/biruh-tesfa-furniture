import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — Automatically scrolls the window to the top on every route change.
 * Mount once inside <Router> in App.jsx.
 * Does not affect modal dialogs or in-page anchor links.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top when the path changes, not on hash/anchor navigation
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
