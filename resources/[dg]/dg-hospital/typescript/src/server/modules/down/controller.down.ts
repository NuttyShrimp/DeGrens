import { Events, Hospital, Inventory, Police, RPC, Screenshot, Status, Util } from '@dgx/server';
import { getHospitalConfig } from 'services/config';
import { downLogger } from './logger.down';
import { sendToAvailableBed } from 'modules/beds/service.beds';
import { revivePlayer } from './service.down';

global.exports('revivePlayer', revivePlayer);

Events.onNet('hospital:down:playerDied', async (src: number, cause: string, killer: number) => {
  downLogger.info(`${Util.getName(src)} has died | cause: ${cause} | killer: ${killer}`);

  global.exports['dg-phone'].brickPhone(src);

  let newStatus = getHospitalConfig().damagetypes[cause].status ?? 'bruises';
  Status.addStatusToPlayer(src, newStatus);

  const fileName = await Screenshot.generateMinioFilename();
  const minioLink = await Screenshot.minio(src, { fileName });
  Util.Log('hospital:down:died', { minioLink, cause, killer }, `${Util.getName(src)} has died`, src);
});

Events.onNet('hospital:down:changeState', (src: number, state: Hospital.State) => {
  const player = DGCore.Functions.GetPlayer(src);
  player.Functions.SetMetaData('downState', state);

  downLogger.info(
    `${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}'s down state has changed to ${state}`
  );
  Util.Log(
    'hospital:down:stageChanged',
    {
      state,
    },
    `${Util.getName(src)}'s down state has changed to ${state}`,
    src
  );
});

RPC.register('hospital:down:getRespawnPosition', src => {
  return getHospitalConfig().health.respawnPosition;
});

Events.onNet('hospital:down:respawnToHospital', (src: number) => {
  Util.Log('hospital:down:respawnToHospital', {}, `${Util.getName(src)} has respawned to hospital`, src);
  Hospital.createDispatchCall({
    title: 'Gewonde persoon binnengebracht',
    description: 'Er heeft iemand een gewonde persoon binnengebracht onderaan het ziekenhuis.',
    coords: getHospitalConfig().health.respawnPosition,
  });
});

Events.onNet('hospital:down:respawnToBed', async (src: number) => {
  Util.Log('hospital:down:respawnToBed', {}, `${Util.getName(src)} has respawned to a bed`, src);
  Inventory.clearPlayerInventory(src);

  await Police.forceUncuff(src);
  await Police.forceStopInteractions(src);

  const bedTimeout = 20000;
  sendToAvailableBed(src, bedTimeout);

  setTimeout(() => {
    revivePlayer(src);
  }, bedTimeout * 0.75);
});
