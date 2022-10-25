import { useCallback } from 'react';

import { useUpdateState } from '../../../lib/redux';

export const useInformationBar = () => {
  const updateState = useUpdateState('bennys');

  const setTitle = useCallback(
    (title: string) => {
      updateState(state => ({
        bars: {
          ...state.bennys.bars,
          title,
        },
      }));
    },
    [updateState]
  );

  const resetTitle = useCallback(() => {
    updateState(state => ({
      bars: {
        ...state.bennys.bars,
        title: "Benny's Motorwork",
        equipped: false,
        isInCart: false,
        price: 0,
      },
    }));
  }, [updateState]);

  const setEquipped = useCallback(
    (equipped: boolean) => {
      updateState(state => ({
        bars: {
          ...state.bennys.bars,
          equipped,
        },
      }));
    },
    [updateState]
  );

  const setIsInCart = useCallback(
    (isInCart: boolean) => {
      updateState(state => ({
        bars: {
          ...state.bennys.bars,
          isInCart,
        },
      }));
    },
    [updateState]
  );

  const setPrice = useCallback(
    (price: number) => {
      updateState(state => ({
        bars: {
          ...state.bennys.bars,
          price,
        },
      }));
    },
    [updateState]
  );

  return {
    setTitle,
    resetTitle,
    setEquipped,
    setPrice,
    setIsInCart,
  };
};

// Returns function to show and hide guide(s)
export const useGuide = (guide: Bennys.Guide | Bennys.Guide[]) => {
  const updateState = useUpdateState('bennys');

  const showGuide = useCallback(() => {
    const guides = Array.isArray(guide) ? guide : [guide];
    updateState(state => ({
      bars: {
        ...state.bennys.bars,
        guides: [
          ...state.bennys.bars.guides,
          ...guides.filter(newGuide => !state.bennys.bars.guides.some(g => g.title === newGuide.title)),
        ],
      },
    }));
  }, [updateState, guide]);

  const hideGuide = useCallback(() => {
    const guides = Array.isArray(guide) ? guide : [guide];
    updateState(state => ({
      bars: {
        ...state.bennys.bars,
        guides: state.bennys.bars.guides.filter(guide => !guides.some(g => guide.title === g.title)),
      },
    }));
  }, [updateState, guide]);

  return {
    showGuide,
    hideGuide,
  };
};
