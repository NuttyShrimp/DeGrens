import { GetInitialState, store, type } from './redux';

export const events: { [appName: string]: { [eventName: string]: (data: any) => void } } = {
  main: {
    restart: () => {
      store.dispatch({
        type,
        cb: state => ({
          ...state,
          main: {
            mounted: false,
            ...state.main,
          },
        }),
      });
      setTimeout(() => {
        store.dispatch({
          type,
          cb: () => GetInitialState(),
        });
      }, 2000);
    },
  },
};
