import { BaseEvents, Events } from '@dgx/client';
import { toggleTransition } from '../service';

Events.onNet('event:cayo:toggle', (toggle: boolean) => {
  toggleTransition(toggle);
});

BaseEvents.onResourceStop(() => {
  toggleTransition(false);
});
