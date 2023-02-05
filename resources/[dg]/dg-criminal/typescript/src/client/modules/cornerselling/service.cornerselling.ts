import { Notifications, Util, Peek, Events } from '@dgx/client';
import { BLACKLISTED_PED_MODELS } from './constants.cornerselling';

let cornersellEnabled = false;
let pedsSoldTo: number[] = [];

export const isCornersellEnabled = () => cornersellEnabled;

export const setCornersellEnabled = (enabled: boolean) => {
  if (cornersellEnabled === enabled) return;

  if (enabled) {
    cornersellEnabled = true;
    Notifications.add('Gestart met verkopen');
  } else {
    cornersellEnabled = false;
  }
};

export const findBuyer = async () => {
  if (!cornersellEnabled) return;

  const ped = PlayerPedId();
  const buyer = Util.getClosestNpcInRange(10, pedsSoldTo);
  if (
    !buyer ||
    IsPedInAnyVehicle(buyer, true) ||
    IsPedDeadOrDying(buyer, true) ||
    BLACKLISTED_PED_MODELS.has(GetEntityModel(buyer) >>> 0)
  ) {
    setTimeout(() => {
      findBuyer();
    }, 1000);
    return;
  }

  let hasSold = false;
  await Util.requestEntityControl(buyer);
  await Util.loadAnimDict('mp_safehouselost@');

  ClearPedTasksImmediately(buyer);
  const buyerCoords = Util.getEntityCoords(buyer);
  const buyerHeading = Util.getHeadingToFaceEntity(buyer);
  await Util.goToCoords({ ...buyerCoords, w: buyerHeading + 180 }, 2000, buyer);

  TaskStartScenarioInPlace(buyer, 'WORLD_HUMAN_STAND_IMPATIENT_UPRIGHT', 0, false);
  const peekId = Peek.addEntityEntry(buyer, {
    options: [
      {
        label: 'Verkoop',
        icon: 'fas fa-handshake',
        action: async (_, entity) => {
          if (!entity) return;

          ClearPedTasksImmediately(entity);
          const plyCoords = Util.getPlyCoords();
          const heading = Util.getHeadingToFaceEntity(entity);

          let pedPositioned = false;
          let buyerPositioned = false;

          Util.goToCoords(
            {
              ...Util.getEntityCoords(entity),
              w: heading + 180,
            },
            3000,
            entity
          ).then(() => {
            buyerPositioned = true;
            FreezeEntityPosition(entity, true);
          });
          Util.goToCoords(
            {
              ...plyCoords,
              w: heading,
            },
            3000
          ).then(() => {
            pedPositioned = true;
          });

          await Util.awaitCondition(() => pedPositioned && buyerPositioned);

          TaskPlayAnim(ped, 'mp_safehouselost@', 'package_dropoff', 8.0, 1.0, -1, 16, 0, false, false, false);
          TaskPlayAnim(entity, 'mp_safehouselost@', 'package_dropoff', 8.0, 1.0, -1, 16, 0, false, false, false);

          setTimeout(() => {
            FreezeEntityPosition(entity, false);
            const zone = GetNameOfZone(plyCoords.x, plyCoords.y, plyCoords.z);
            Events.emitNet('criminal:cornersell:sell', zone);
            hasSold = true;
          }, 5000);
        },
      },
    ],
    distance: 1.4,
  });

  // Await ped being too far away, ped dead or sold to ped
  await Util.awaitCondition(() => {
    const distance = Util.getPlyCoords().distance(Util.getEntityCoords(buyer));
    return distance > 20 || IsPedDeadOrDying(buyer, true) || hasSold;
  }, 60000);

  SetPedKeepTask(buyer, false);
  ClearPedTasks(buyer);
  TaskWanderStandard(buyer, 10, 10);
  SetPedAsNoLongerNeeded(buyer);
  pedsSoldTo.push(buyer);
  Peek.removeEntityEntry(peekId);
};
