import { Events, Police, Util } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { getConfig } from 'helpers/config';

export const handleStartRegister = async (
  plyId: number,
  storeId: Storerobbery.Id,
  registerIdx: number,
  isBroken: boolean
) => {
  stateManager.setCanRob(plyId, registerIdx, false);
  Events.emitNet('storerobbery:registers:doRobbing', plyId, registerIdx, isBroken);
  Util.changePlayerStress(plyId, Util.getRndInteger(2, 5));

  const storeConfig = getConfig().stores[storeId];
  Police.createDispatchCall({
    tag: '10-35',
    title: `Inbraak winkelkassa`,
    description: `Het inbraakalarm op een winkelkassa is net afgegaan`,
    coords: storeConfig.registerzone.center,
    entries: {
      'camera-cctv': storeConfig.cam,
    },
    blip: {
      sprite: 628,
      color: 5,
    },
  });
};
