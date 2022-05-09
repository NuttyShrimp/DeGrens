import React from 'react';

import { Loader } from '../../components/util';
import { store, type } from '../../lib/redux';

export const setModal = (modal: React.FC<React.PropsWithChildren<unknown>>) => {
  store.dispatch({
    type,
    cb: state => ({
      ...state,
      financials: {
        ...state.financials,
        backdrop: true,
        modalComponent: modal,
      },
    }),
  });
};

export const openLoadModal = () => {
  setModal(Loader);
};

export const closeModal = () => {
  store.dispatch({
    type,
    cb: state => ({
      ...state,
      financials: {
        ...state.financials,
        backdrop: false,
        modalComponent: null,
      },
    }),
  });
};
