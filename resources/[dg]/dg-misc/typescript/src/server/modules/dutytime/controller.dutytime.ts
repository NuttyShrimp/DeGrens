import { Events } from '@dgx/server';
import { addDutyTimeEntry, showDutyTimeList, getDutyTime } from './service.dutytime';

global.exports('addDutyTimeEntry', addDutyTimeEntry);
global.exports('showDutyTimeList', showDutyTimeList);
global.exports('getDutyTime', getDutyTime);

Events.onNet('misc:dutytime:showList', showDutyTimeList);
