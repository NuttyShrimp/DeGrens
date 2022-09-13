import { Config, Events, Jobs, RPC } from '@dgx/server';

let config: HUD.Config;

const updateStress = (src: number, amount: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) return;
  if (Jobs.getCurrentJob(src) === 'police') {
    amount *= 0.6;
  }
  const newStress = Math.max(0, Math.min(100, (Player.PlayerData.metadata.stress ?? 0) + amount));
  Player.Functions.SetMetaData('stress', newStress);
  Events.emitNet('hud:client:updateStress', src, newStress);
};

Events.onNet('hud:server:GainStress', (src, amount: number) => {
  updateStress(src, amount);
});

Events.onNet('hud:server:RelieveStress', (src, amount: number) => {
  updateStress(src, -amount);
});

RPC.register('hud:server:getConfig', async () => {
  if (config) return config;
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig('hud');
  return config;
});
