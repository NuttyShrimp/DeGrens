import { useMonumentsStoreApp } from './stores/useMonumentsStore';

export const events: Phone.Events = {
  showApp: () => {
    useMonumentsStoreApp.setState(s => ({ ...s, hidden: false }));
  },
};
