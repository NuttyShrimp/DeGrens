import { Events } from '@dgx/client';
import { setShellTypes } from './service.interior';

Events.onNet('houserobbery:server:setShellTypes', setShellTypes);
