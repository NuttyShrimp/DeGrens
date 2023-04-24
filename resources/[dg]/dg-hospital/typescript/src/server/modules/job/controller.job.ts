import { Events, Notifications, Status, Util, Hospital, Jobs, Police, Taskbar } from '@dgx/server';
import { getHospitalConfig } from 'services/config';
import { mainLogger } from 'sv_logger';
import { healClosestPlayer } from './service.job';
import { sendToAvailableBed } from 'modules/beds/service.beds';
import { revivePlayer } from 'modules/down/service.down';

Events.onNet('hospital:job:checkStatus', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'ambulance') {
    Notifications.add(src, 'Je bent geen dokter', 'error');
    mainLogger.warn(`${Util.getName(src)} tried to check a players status but was not a doctor`);
    return;
  }

  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (target === undefined) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }

  const checkable = getHospitalConfig().job.checkableStatuses;
  Status.showStatusesToPlayer(src, target, checkable);
});

Events.onNet('hospital:job:checkin', async (src: number) => {
  const checkinLocation = getHospitalConfig().job.checkinZone.center;
  if (Util.getPlyCoords(src).distance(checkinLocation) > 20) {
    Notifications.add(src, 'Je bent niet aan de incheckbalie', 'error');
    mainLogger.error(`${Util.getName(src)} tried to checkin but was not at spot`);
    return;
  }

  const anyAmbulance = Jobs.getAmountForJob('ambulance') > 0;

  Util.Log('hospital:job:checkin', { anyAmbulance }, `${Util.getName(src)} has checked in to hospital`, src);

  if (anyAmbulance) {
    const charInfo = DGCore.Functions.GetPlayer(src)?.PlayerData?.charinfo;
    Hospital.createDispatchCall({
      title: 'Incheckbalie',
      description: `${charInfo?.firstname ?? 'Unknown'} ${
        charInfo?.lastname ?? 'Person'
      }(${src}) heeft ingechecked aan de balie`,
      coords: checkinLocation,
      skipCoordsRandomization: true,
    });
    Notifications.add(src, 'Er is een dokter opgeroepen, neem plaats in de wachtzaal', 'success');
    return;
  }

  await Police.forceStopInteractions(src);

  const taskbarInfo: TaskBar.TaskBarSettings = {
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    canCancel: true,
    cancelOnMove: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  };

  if (!Hospital.isDown(src) && !Police.isCuffed(src)) {
    taskbarInfo.animation = {
      task: 'WORLD_HUMAN_CLIPBOARD',
    };
  }

  const [canceled] = await Taskbar.create(src, 'file-signature', 'Inchecken', 5000, taskbarInfo);
  if (canceled) return;

  const bedTimeout = 20000;
  sendToAvailableBed(src, bedTimeout);

  setTimeout(() => {
    revivePlayer(src);
  }, bedTimeout * 0.75);
});

Events.onNet('hospital:job:heal', (plyId: number) => {
  const plyJob = Jobs.getCurrentJob(plyId);
  const amountOfAmbu = Jobs.getAmountForJob('ambulance');

  if (plyJob !== 'ambulance' && (plyJob !== 'police' || amountOfAmbu > 0)) {
    Notifications.add(plyId, 'Je kan dit niet', 'error');
    mainLogger.warn(`${Util.getName(plyId)}(${plyId}) tried to heal player but was not a doctor`);
    return;
  }

  healClosestPlayer(plyId);
});

Events.onNet('hospital:job:assistence', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'ambulance') {
    Notifications.add(src, 'Je bent geen dokter', 'error');
    mainLogger.warn(`${Util.getName(src)} tried to call police assistence but was not a doctor`);
    return;
  }

  const plyCoords = Util.getPlyCoords(src);
  Police.createDispatchCall({
    title: 'Assistentie Gevraagd',
    description: `Een personeelslid van het ziekenhuis vraagt om politie assistentie`,
    coords: plyCoords,
    skipCoordsRandomization: true,
    officer: src,
    tag: '10-78',
    blip: {
      sprite: 280,
      color: 2,
    },
  });
});
