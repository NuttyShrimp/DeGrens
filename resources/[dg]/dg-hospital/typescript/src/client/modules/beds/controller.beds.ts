import { Events, Keys } from '@dgx/client';
import { enterBed, leaveBed } from './service.beds';

Events.onNet('hospital:beds:enter', (position: Vec4, timeout: number) => {
  enterBed(position, timeout);
});

Keys.onPressDown('GeneralUse', () => {
  leaveBed();
});
