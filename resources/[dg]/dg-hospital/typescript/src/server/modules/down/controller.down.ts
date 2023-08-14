import { Core, Events, Hospital, Inventory, Jobs, Police, RPC, Screenshot, Status, Util } from '@dgx/server';
import { getHospitalConfig } from 'services/config';
import { downLogger } from './logger.down';
import { sendToAvailableBed } from 'modules/beds/service.beds';
import { revivePlayer } from './service.down';

global.exports('revivePlayer', revivePlayer);

Events.onNet('hospital:down:playerDied', async (src: number, cause: string, killer: number) => {
  const killerName = Util.getName(killer) ?? 'Unknown';
  downLogger.info(`${Util.getName(src)} has died | cause: ${cause} | killer: ${killerName}(${killer})`);

  global.exports['dg-phone'].brickPhone(src);
  Police.forceStopInteractions(src);

  let newStatus = getHospitalConfig().damagetypes[cause].status ?? 'bruises';
  Status.addStatusToPlayer(src, newStatus);

  const timeOfDead = new Date().toLocaleTimeString();

  const minioPromises = [Screenshot.generateMinioFilename().then(fileName => Screenshot.minio(src, { fileName }))];
  if (Util.getName(killer)) {
    minioPromises.push(Screenshot.generateMinioFilename().then(fileName => Screenshot.minio(killer, { fileName })));
  }
  const screenshots = await Promise.race([Util.Delay(20000), Promise.all(minioPromises)]);

  Util.Log(
    'hospital:down:died',
    {
      minioLinkVictim: screenshots?.[0] ?? 'Failed to take screenshot',
      minioLinkKiller: screenshots?.[1] ?? 'Failed to take screenshot',
      cause,
      killer,
      killerName,
      timeOfDead,
    },
    `${Util.getName(src)}(${src}) has died by ${killerName}${killer} (${cause})`,
    src
  );
});

Events.onNet('hospital:down:changeState', (src: number, state: Hospital.State) => {
  const player = Core.getPlayer(src);
  if (!player) return;

  player.updateMetadata('downState', state);

  downLogger.info(`${player.charinfo.firstname} ${player.charinfo.lastname}'s down state has changed to ${state}`);
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
  Police.forceStopInteractions(src);

  Util.Log('hospital:down:respawnToHospital', {}, `${Util.getName(src)} has respawned to hospital`, src);
  Hospital.createDispatchCall({
    title: 'Gewonde persoon binnengebracht',
    description: 'Er heeft iemand een gewonde persoon binnengebracht onderaan het ziekenhuis.',
    coords: getHospitalConfig().health.respawnPosition,
    skipCoordsRandomization: true,
  });
});

Events.onNet('hospital:down:respawnToBed', async (src: number) => {
  Util.Log('hospital:down:respawnToBed', {}, `${Util.getName(src)} has respawned to a bed`, src);

  // dont clear police inv
  if (Jobs.getCurrentJob(src) !== 'police') {
    Inventory.clearPlayerInventory(src);
  }

  await Police.forceUncuff(src);
  await Police.forceStopInteractions(src);

  const bedTimeout = 20000;
  sendToAvailableBed(src, bedTimeout);

  setTimeout(() => {
    revivePlayer(src);
  }, bedTimeout * 0.75);
});

Core.onPlayerUnloaded((plyId, cid, playerData) => {
  const downState = playerData.metadata.downState;
  if (downState === 'alive') return;
  Util.Log(
    'hospital:down:loggedOut',
    { cid, plyId, downState },
    `${playerData.name}(${playerData.serverId}) has logged out while being ${downState}`
  );
});
