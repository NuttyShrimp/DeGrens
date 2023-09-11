import { Events } from '@dgx/server';
import { handlePlayerEnteredSpeedZone } from './service.speedzones';

Events.onNet('police:speedzones:entered', handlePlayerEnteredSpeedZone);
