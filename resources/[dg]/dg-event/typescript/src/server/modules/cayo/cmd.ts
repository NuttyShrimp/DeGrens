import { Events } from '@dgx/server';
import { isCayoEnabled, toggleCayo } from './state';
import { mainLogger } from 'sv_logger';

RegisterCommand(
  'event:cayo:show',
  () => {
    if (isCayoEnabled()) return;
    toggleCayo(true);
    Events.emitNet('event:cayo:toggle', -1, true);
    mainLogger.info('Cayo Perico is now enabled');
  },
  false
);

RegisterCommand(
  'event:cayo:hide',
  () => {
    if (!isCayoEnabled()) return;
    toggleCayo(false);
    Events.emitNet('event:cayo:toggle', -1, false);
    mainLogger.info('Cayo Perico is now disabled');
  },
  false
);
