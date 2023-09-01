import { Financials, Hospital, Notifications, Npcs, Phone, Taskbar, Util } from '@dgx/server';
import config from 'services/config';

let nextDoctorId = 0;
const activeDoctors = new Map<
  number,
  {
    locationIdx: number;
    plyId: number;
    inUse: boolean;
    awaitingRemoval: boolean;
  }
>();

const isLocationIdxInUse = (locationIdx: number) => {
  for (const [_, activeDoctor] of activeDoctors) {
    if (activeDoctor.locationIdx !== locationIdx) continue;
    return true;
  }
  return false;
};

const doesPlayerHaveActiveDoctor = (plyId: number) => {
  for (const [_, activeDoctor] of activeDoctors) {
    if (activeDoctor.plyId !== plyId) continue;
    return true;
  }
  return false;
};

const getUnusedLocationIdx = (): number | undefined => {
  const availableIds = Util.shuffleArray([...new Array(config.doctor.locations.length)].map((_, i) => i));
  while (availableIds.length > 0) {
    const locationIdx = availableIds.pop();
    if (locationIdx === undefined) return;
    if (isLocationIdxInUse(locationIdx)) continue;
    return locationIdx;
  }
};

const sendDoctorMail = (plyId: number, message: string, coords?: Vec3) => {
  Phone.addMail(plyId, {
    subject: 'Dokterservice',
    sender: 'Dokter B',
    message,
    coords,
  });
};

export const requestDoctorLocation = async (plyId: number): Promise<string> => {
  const locationIdx = getUnusedLocationIdx();
  if (locationIdx === undefined) return 'No doctors available';

  if (doesPlayerHaveActiveDoctor(plyId)) {
    return 'You have already requested a location';
  }

  const paid = await Financials.cryptoRemove(plyId, config.doctor.payment.coin, config.doctor.payment.amount);
  if (!paid) return 'You do not have enough funds to pay';

  const doctorId = ++nextDoctorId;
  activeDoctors.set(doctorId, {
    locationIdx,
    plyId,
    inUse: false,
    awaitingRemoval: false,
  });

  Npcs.add({
    id: `criminal-doctor-${doctorId}`,
    position: config.doctor.locations[locationIdx],
    model: config.doctor.npcModel,
    distance: 100,
    settings: {
      invincible: true,
      ignore: true,
      freeze: true,
      collision: true,
    },
    flags: {
      criminalDoctorId: doctorId,
    },
  });

  sendDoctorMail(plyId, 'Ik sta op de locatie te wachten, tot zo.', config.doctor.locations[locationIdx]);

  return 'Successfully requested location';
};

export const healClosestPlayerToDoctor = async (plyId: number, doctorId: number) => {
  const activeDoctor = activeDoctors.get(doctorId);
  if (!activeDoctor) {
    Notifications.add(plyId, 'Dit is geen actieve dokter', 'error');
    return;
  }

  const doctorLocation = config.doctor.locations[activeDoctor.locationIdx];
  const plyCoords = Util.getPlyCoords(plyId);
  if (plyCoords.distance(doctorLocation) > 10) {
    Notifications.add(plyId, 'Je bent niet bij de dokter', 'error');
    return;
  }

  const possibleTargets = Util.getAllPlayersInRange(plyId, 2);
  let targetPlayer: number | undefined;
  for (const possibleTarget of possibleTargets) {
    if (!Hospital.isDown(possibleTarget)) continue;
    targetPlayer = possibleTarget;
    break;
  }

  if (!targetPlayer) {
    Notifications.add(plyId, 'Er is niemand in de buurt die hulp nodig heeft', 'error');
    return;
  }

  if (activeDoctor.inUse) {
    Notifications.add(plyId, 'Ik ben momenteel al iemand aan het helpen', 'error');
    return;
  }

  activeDoctor.inUse = true;
  const [canceled] = await Taskbar.create(
    plyId,
    'suitcase-medical',
    'Verzorgen',
    Util.isDevEnv() ? 1000 : config.doctor.duration,
    {
      canCancel: true,
      cancelOnDeath: true,
      cancelOnMove: true,
      disableInventory: true,
      disablePeek: true,
      disarm: true,
      controlDisables: {
        movement: true,
        carMovement: true,
        combat: true,
      },
      animation: {
        animDict: 'mini@cpr@char_a@cpr_str',
        anim: 'cpr_pumpchest',
        flags: 1,
      },
    }
  );
  activeDoctor.inUse = false;
  if (canceled) return;

  Hospital.revivePlayer(targetPlayer);

  if (!activeDoctor.awaitingRemoval) {
    activeDoctor.awaitingRemoval = true;

    Util.awaitCondition(() => !Util.isAnyPedInRange(doctorLocation, 200), false, 5000).then(() => {
      removeActiveDoctor(doctorId);
    });
  }
};

const removeActiveDoctor = (doctorId: number) => {
  const activeDoctor = activeDoctors.get(doctorId);
  if (!activeDoctor) return;

  Npcs.remove(`criminal-doctor-${doctorId}`);
  activeDoctors.delete(doctorId);

  if (GetPlayerName(String(activeDoctor.plyId))) {
    sendDoctorMail(activeDoctor.plyId, 'Bedankt voor gebruik te maken van mijn services, tot de volgende keer');
  }
};
