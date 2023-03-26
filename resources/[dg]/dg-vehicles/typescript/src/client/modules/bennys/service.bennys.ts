import { Events, Notifications, RPC, Sounds, Taskbar, UI, Util } from '@dgx/client';
import { getAppliedStance } from 'modules/stances/service.stances';
import { fixVehicle } from 'modules/status/service.status';
import { getCosmeticUpgrades } from 'modules/upgrades/service.upgrades';
import { setEngineState } from 'services/engine';

import { getCurrentVehicle, isDriver } from '../../helpers/vehicle';

let bennysMenuOpen = false;
let currentBennys: string | null = null;
let locations: Record<string, Bennys.Location> = {};
let keyThread: number | null = null;
let equippedUpgradesOnEnter: Upgrades.Cosmetic;
const enableKeys = [0, 1, 2, 3, 4, 5, 6, 46, 249];

export let modelStanceData: Stance.Model[] = [];
export let originalStance: Stance.Data;

export const isBennysMenuOpen = () => bennysMenuOpen;
export const setBennysMenuOpen = (open: boolean) => (bennysMenuOpen = open);

// region getters and setters
export const setLocations = (locs: Bennys.Location[]) => {
  locations = locs.reduce<Record<string, Bennys.Location>>((acc, cur) => {
    acc[cur.name] = cur;
    return acc;
  }, {});
};

export const setCurrentBennys = (id: string | null) => {
  currentBennys = id;
};

export const getCurrentBennys = () => {
  return currentBennys;
};

export const getRepairData = (plyVeh: number): Bennys.RepairInfo | null => {
  // Get body damage
  // We fetch it on client to prevent desync issues etc
  const bodyHealth = GetVehicleBodyHealth(plyVeh);
  const engineHealh = GetVehicleEngineHealth(plyVeh);
  if (bodyHealth > 990 && engineHealh > 990) return null;
  return {
    price: (Math.round(((2000 - bodyHealth - engineHealh) / 2) * 100) / 100) * (300 / 2000),
    body: bodyHealth,
    engine: engineHealh,
  };
};

export const getEquippedUpgradesOnEnter = () => equippedUpgradesOnEnter;
// endregion

export const handleVehicleRepair = async () => {
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return;
  const currentBennys = getCurrentBennys();
  if (!currentBennys) return;

  const paidForRepair = await RPC.execute<boolean>('vehicles:bennys:payForRepair', currentBennys);
  if (!paidForRepair) {
    Notifications.add('Je hebt niet genoeg cash', 'error');
    return;
  }

  const repairTimes = await RPC.execute<Omit<Bennys.RepairInfo, 'price'>>(
    'vehicles:bennys:getRepairTimes',
    currentBennys
  );
  if (!repairTimes) return;

  // setvehiclefixed native in body part cant be set if engine is broken so engine first
  if (repairTimes.engine > 0) {
    await Taskbar.create('car-wrench', 'Repairing Engine', Math.max(1000, repairTimes.engine), {
      cancelOnMove: true,
      controlDisables: {
        carMovement: true,
        movement: true,
      },
    });
    Sounds.playLocalSound('airwrench', 0.08);
    fixVehicle(plyVeh, false, true);
  }
  if (repairTimes.body > 0) {
    await Taskbar.create('car-wrench', 'Repairing Body', Math.max(1000, repairTimes.body), {
      cancelOnMove: true,
      controlDisables: {
        carMovement: true,
        movement: true,
      },
    });
    Sounds.playLocalSound('airwrench', 0.08);
    fixVehicle(plyVeh, true, false);
  }
};

export const openUI = async (upgrades: Upgrades.Cosmetic, price: number | null = null) => {
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return;
  if (!isDriver()) return;
  equippedUpgradesOnEnter = upgrades;
  modelStanceData = (await RPC.execute('vehicles:stance:getModelData', GetEntityModel(plyVeh))) ?? [];
  originalStance = getAppliedStance(plyVeh);
  setEngineState(plyVeh, false, true);
  DisplayRadar(false);
  startKeyThread();
  UI.openApplication(
    'bennys',
    {
      repairCost: price,
    },
    true
  );
  UI.SetUIFocusCustom(true, false);
  bennysMenuOpen = true;
};

export const closeUI = () => {
  UI.closeApplication('bennys');
  stopKeyThread();
  const currentBennys = getCurrentBennys();
  if (!currentBennys) return;
  setTimeout(() => {
    Events.emitNet('vehicles:bennys:leaveSpot', currentBennys);
  }, 1000);
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return;
  FreezeEntityPosition(plyVeh, false);
  setEngineState(plyVeh, true, true);
  DisplayRadar(true);
  bennysMenuOpen = false;

  // Stop pausemenu from opening
  let counter = 100;
  const interval = setInterval(() => {
    if (counter === 0) {
      clearInterval(interval);
      return;
    }
    if (IsPauseMenuActive()) {
      SetPauseMenuActive(false);
    }
    DisableControlAction(0, 199, true);
    DisableControlAction(0, 200, true);
    counter--;
  }, 1);
};

// region Key thread
export const startKeyThread = () => {
  if (keyThread !== null) return;
  global.exports['dg-lib'].shouldExecuteKeyMaps(false);
  keyThread = setTick(() => {
    if (!currentBennys) {
      stopKeyThread();
      return;
    }
    DisableAllControlActions(0);
    // Reenable mouse movement
    enableKeys.forEach(key => {
      EnableControlAction(0, key, true);
    });
    // Disable pause menu
    SetPauseMenuActive(false);
  });
};

export const stopKeyThread = () => {
  if (keyThread === null) return;
  clearTick(keyThread);
  keyThread = null;
  global.exports['dg-lib'].shouldExecuteKeyMaps(true);
};
// endregion

export const enterBennys = async (fromAdminMenu = false) => {
  if (fromAdminMenu) {
    const cid = DGCore.Functions.GetPlayerData().citizenid;
    setCurrentBennys(`bennys_admin_${cid}`);
  }

  const currentBennys = getCurrentBennys();
  if (!currentBennys) return;

  let currentSpotData: Pick<Bennys.Location, 'vector' | 'heading'> | undefined = locations[currentBennys];
  if (!currentSpotData) {
    currentSpotData = {
      vector: Util.getPlyCoords(),
      heading: GetEntityHeading(PlayerPedId()),
    };
  }

  const plyVeh = getCurrentVehicle();
  if (!plyVeh || !isDriver()) return;

  const isSpotFree = await RPC.execute<boolean>('vehicles:bennys:isSpotFree', currentBennys);
  if (!isSpotFree) return;

  SetEntityCoords(
    plyVeh,
    currentSpotData.vector.x,
    currentSpotData.vector.y,
    currentSpotData.vector.z,
    true,
    false,
    false,
    true
  );
  SetEntityHeading(plyVeh, currentSpotData.heading);
  FreezeEntityPosition(plyVeh, true);

  const currentUpgrades = getCosmeticUpgrades(plyVeh);
  if (!currentUpgrades) return;
  const repairData = getRepairData(plyVeh);
  const entered = await RPC.execute<boolean>(
    'vehicles:bennys:enterSpot',
    currentBennys,
    NetworkGetNetworkIdFromEntity(plyVeh),
    currentUpgrades,
    repairData
  );
  if (entered) {
    UI.hideInteraction();
    openUI(currentUpgrades, repairData?.price);
  } else {
    FreezeEntityPosition(plyVeh, false);
  }
};
