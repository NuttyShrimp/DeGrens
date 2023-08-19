import { freezeTime, setGlobalTime } from './service.time';

AddStateBagChangeHandler('time', 'global', (_: string, __: string, value: number) => {
  setGlobalTime(+value);
});

global.exports('freezeTime', freezeTime);
