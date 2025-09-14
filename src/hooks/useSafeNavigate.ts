import { useNavigate as useReactRouterNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Safe navigation hook that falls back to window.location if Router context is not available
 */
export const useSafeNavigate = () => {
  let navigate: ReturnType<typeof useReactRouterNavigate> | null = null;
  
  try {
    navigate = useReactRouterNavigate();
  } catch (error) {
    // Router context not available - will use fallback
    console.warn('Router context not available, using window.location fallback');
  }

  return useCallback((path: string, options?: { replace?: boolean }) => {
    if (navigate) {
      // Use React Router navigation
      navigate(path, options);
    } else {
      // Fallback to window.location
      if (options?.replace) {
        window.location.replace(path);
      } else {
        window.location.href = path;
      }
    }
  }, [navigate]);
};