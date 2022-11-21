import { isCornersellEnabled, setCornersellEnabled } from './service.cornerselling';

on('criminal:cornersell:toggle', () => {
  setCornersellEnabled(!isCornersellEnabled());
});
