import { Auth, Config, Events, Util } from '@dgx/server';

let config: Config.Seats.Config;

setImmediate(async () => {
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig<Config.Seats.Config>('seats');
  Events.emitNet('misc:seats:seed', -1, config);
});

onNet('dg-config:moduleLoaded', (module: string, data: Config.Seats.Config) => {
  if (module !== 'seats') return;
  Events.emitNet('misc:seats:seed', -1, data);
  config = data;
});

Auth.onAuth(async src => {
  if (config === null) return;
  Events.emitNet('misc:seats:seed', src, config);
});
