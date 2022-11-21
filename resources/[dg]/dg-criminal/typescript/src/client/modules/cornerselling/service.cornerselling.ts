import { Notifications, RPC, Jobs, Util, Peek, Events } from '@dgx/client';
import { BLACKLISTED_PED_MODELS } from './constants.cornerselling';

let cornersellEnabled = false;
let requiredCops = 0;

const pedsSoldTo: number[] = [];

export const isCornersellEnabled = () => cornersellEnabled;
export const setCornersellEnabled = async (enabled: boolean) => {
  if (!enabled) {
    cornersellEnabled = false;
    Notifications.add('Gestopt met verkopen');
    return;
  }

  const hasSellableItems = await RPC.execute<boolean>('criminal:cornersell:hasSellables');
  if (!hasSellableItems) {
    Notifications.add('Je hebt niks om te verkopen', 'error');
    return;
  }

  const copCount = Jobs.getAmountForJob('police');
  if (copCount < requiredCops) {
    Notifications.add('Er is momenteel geen interesse', 'error');
    return;
  }

  Notifications.add('Gestart met verkopen');
  cornersellEnabled = true;

  findBuyer();
};

export const setRequiredCopsForCornersell = (amount: number) => {
  requiredCops = amount;
};

const findBuyer = async () => {
  if (!cornersellEnabled) return;

  await Util.Delay(5000);

  const ped = PlayerPedId();
  const buyer = Util.getClosestPedInRange(10, pedsSoldTo);
  if (
    !buyer ||
    IsPedInAnyVehicle(buyer, true) ||
    IsPedDeadOrDying(buyer, true) ||
    BLACKLISTED_PED_MODELS.has(GetEntityModel(buyer))
  ) {
    findBuyer();
    return;
  }

  let hasSold = false;
  TaskStartScenarioInPlace(buyer, 'WORLD_HUMAN_STAND_IMPATIENT_UPRIGHT', 0, false);
  const peekId = Peek.addEntityEntry(buyer, {
    options: [
      {
        label: 'Verkoop',
        icon: 'fas fa-handshake',
        action: async () => {
          await Util.loadAnimDict('mp_safehouselost@');
          TaskPlayAnim(ped, 'mp_safehouselost@', 'package_dropoff', 8.0, 1.0, -1, 16, 0, false, false, false);
          TaskPlayAnim(buyer, 'mp_safehouselost@', 'package_dropoff', 8.0, 1.0, -1, 16, 0, false, false, false);
          await Util.Delay(5000);
          RemoveAnimDict('mp_safehouselost@');

          Events.emitNet('criminal:cornersell:sell');
          hasSold = true;
        },
      },
    ],
    distance: 1.0,
  });

  // Promise resolved when ped is too far away, ped is dead or we sold to ped
  await new Promise<void>(res => {
    const interval = setInterval(() => {
      const distance = Util.getPlyCoords().distance(Util.getEntityCoords(buyer));
      if (distance > 20 || IsPedDeadOrDying(buyer, true) || hasSold) {
        clearInterval(interval);
        res();
      }
    }, 50);
  });

  SetPedKeepTask(buyer, false);
  ClearPedTasks(buyer);
  TaskWanderStandard(buyer, 10, 10);
  SetPedAsNoLongerNeeded(buyer);
  pedsSoldTo.push(buyer);
  Peek.removeEntityEntry(peekId);

  setTimeout(() => {
    findBuyer();
  }, 10000);
};
