import { getNeed, setNeed } from './service.needs';

global.exports('setNeed', setNeed);

on('hospital:revive', (src: number) => {
  if (getNeed(src, 'hunger') < 2) {
    setNeed(src, 'hunger', () => 20);
  }
  if (getNeed(src, 'thirst') < 2) {
    setNeed(src, 'thirst', () => 20);
  }
});
