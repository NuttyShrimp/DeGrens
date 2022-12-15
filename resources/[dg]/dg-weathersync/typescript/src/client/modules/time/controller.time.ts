import { freezeTime, setGameTime } from './service.time';

AddStateBagChangeHandler('time', 'global', (bagName: string, keyName: string, value: number) => {
  setGameTime(Number(value));
});

global.exports('freezeTime', freezeTime);
