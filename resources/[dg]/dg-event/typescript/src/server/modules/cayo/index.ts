import { Auth, Events } from '@dgx/server';
import './cmd';
import { isCayoEnabled } from './state';

Auth.onAuth(src => {
  if (!isCayoEnabled()) return;
  Events.emitNet('event:cayo:toggle', src, true);
});
