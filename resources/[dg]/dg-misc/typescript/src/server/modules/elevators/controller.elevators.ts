import { Auth, Config, Events } from '@dgx/server';

on('dg-config:moduleLoaded', (moduleName: string, elevators: Elevators.Config) => {
  if (moduleName !== 'elevators') return;
  Events.emitNet('elevators:client:set', -1, elevators);
});

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();
  const elevators = Config.getModuleConfig('elevators');
  Events.emitNet('elevators:client:set', plyId, elevators);
});
