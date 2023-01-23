import { Events, Jobs, Config } from '@dgx/server';

let config: HUD.Config;

export const loadHudConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig('hud');
};

export const dispatchHudConfigToPlayer = (plyId: number) => {
  Events.emitNet('hud:client:initialize', plyId, config);
};

export const updateStress = (src: number, amount: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) return;
  if (Jobs.getCurrentJob(src) === 'police') {
    amount *= 0.6;
  }
  const newStress = Math.max(0, Math.min(100, (Player.PlayerData.metadata.stress ?? 0) + amount));
  Player.Functions.SetMetaData('stress', newStress);
  Events.emitNet('hud:client:updateStress', src, newStress);
};
