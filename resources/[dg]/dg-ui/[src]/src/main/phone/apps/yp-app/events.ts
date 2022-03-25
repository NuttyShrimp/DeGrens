import { genericAction } from '../../lib';

export const events: Phone.Events = {};

events.setCurrentAd = (ad: Phone.YellowPages.Ad) => {
  ad = ad ?? null;
  genericAction('phone.apps.yellowpages', {
    current: ad,
  });
};
