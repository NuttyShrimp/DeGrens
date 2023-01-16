import { useCallback } from 'react';

import { useBennyStore } from '../stores/useBennyStore';

// Returns function to show and hide guide(s)
export const useGuide = (guide: Bennys.Guide | Bennys.Guide[]) => {
  const [addGuides, removeGuiders] = useBennyStore(s => [s.addGuides, s.removeGuides]);
  const showGuide = useCallback(() => {
    const guides = Array.isArray(guide) ? guide : [guide];
    addGuides(guides);
  }, [addGuides, guide]);

  const hideGuide = useCallback(() => {
    const guides = Array.isArray(guide) ? guide : [guide];
    removeGuiders(guides);
  }, [removeGuiders, guide]);

  return {
    showGuide,
    hideGuide,
  };
};
