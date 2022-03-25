import { store, type } from '../../lib/redux';

export const setModal = (modal: React.FC) => {
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
