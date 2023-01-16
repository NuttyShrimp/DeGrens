import { useYPAppStore } from './stores/useYPAppStore';

export const events: Phone.Events = {};

events.setCurrentAd = (ad: Phone.YellowPages.Ad) => {
  ad = ad ?? null;
  useYPAppStore.setState({
    current: ad,
  });
};
