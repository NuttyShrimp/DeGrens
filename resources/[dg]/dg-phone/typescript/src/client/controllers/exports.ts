import { getState } from 'services/state';

global.exports('isOpen', () => {
  return getState('state') !== 0;
});
