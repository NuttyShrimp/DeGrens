import { store, type } from './redux';

export const events: { [appName: string]: { [eventName: string]: (data: any) => void } } = {
  main: {
    restart: () => {
      store.dispatch({
        type,
        cb: state => ({
          ...state,
          main: {
            ...state.main,
            mounted: false,
          },
        }),
      });
    },
  },
};
