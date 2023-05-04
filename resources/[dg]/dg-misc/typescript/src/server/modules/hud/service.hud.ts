import { Events, Jobs, Config, Core } from '@dgx/server';

let config: HUD.Config;

export const loadHudConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig('hud');
};

export const dispatchHudConfigToPlayer = (plyId: number) => {
  Events.emitNet('hud:client:initialize', plyId, config);
};

export const loadStress = (plyId: number, amount: number) => {
  Player(plyId).state.stressAmount = amount;
};

export const changeStress = (plyId: number, amount: number) => {
  const player = Core.getPlayer(plyId);
  if (!player) return;
  if (Jobs.getCurrentJob(plyId) === 'police') {
    amount *= 0.6;
  }
  const newStress = Math.max(0, Math.min(100, (player.metadata.stress ?? 0) + amount));
  const roundedNewStress = Math.round(newStress * 10) / 10;
  player.updateMetadata('stress', roundedNewStress);
  Player(plyId).state.stressAmount = roundedNewStress;
};
