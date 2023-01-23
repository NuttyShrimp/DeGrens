import { Events } from '@dgx/client';
import { isCornersellEnabled, setCornersellEnabled, setRequiredCopsForCornersell } from './service.cornerselling';

on('criminal:cornersell:toggle', () => {
  setCornersellEnabled(!isCornersellEnabled());
});

Events.onNet('criminal:cornersell:setRequiredCops', (amount: number) => {
  setRequiredCopsForCornersell(amount);
});
