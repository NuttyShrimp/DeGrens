import { PolyZone } from '@dgx/client';
import { enteredSpeedZone } from './service.speedzones';

PolyZone.onEnter('police_speedzone', () => {
  enteredSpeedZone();
});
