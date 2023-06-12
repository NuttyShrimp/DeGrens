import { Events, Notifications, RPC, Sounds, Taskbar, UI, Util } from '@dgx/client';
import { getAppliedStance } from 'modules/stances/service.stances';
import { fixVehicle } from 'modules/status/service.status';
import { setEngineState } from 'services/engine';
import { getCurrentVehicle, getVehicleConfig, isDriver } from '../../helpers/vehicle';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';

let bennysMenuOpen = false;
let currentBennys: string | null = null;
let locations: Record<string, Bennys.Location> = {};
let keyThread: number | null = null;
let equippedUpgradesOnEnter: Vehicles.Upgrades.Cosmetic.Upgrades;
let blockedUpgrades: Partial<Record<Vehicles.Upgrades.Cosmetic.Key, number[]>> = {};
const enableKeys = [0, 1, 2, 3, 4, 5, 6, 46, 249];

let modelStanceData: Stance.Model[] = [];
let originalStance: Stance.Data;

export const isBennysMenuOpen = () => bennysMenuOpen;
export const setBennysMenuOpen = (open: boolean) => (bennysMenuOpen = open);

export const getModelStanceData = () => modelStanceData;
export const getOriginalStance = () => originalStance;

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
export const getBlockedUpgrades = () => blockedUpgrades;
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
    const cid = LocalPlayer.state.citizenid;
    setCurrentBennys(`bennys_admin_${cid}`);
  }

  const currentBennys = getCurrentBennys();
  if (!currentBennys) return;

  const plyVeh = getCurrentVehicle();
  if (!plyVeh || !isDriver()) return;

  const isSpotFree = await RPC.execute<boolean>('vehicles:bennys:isSpotFree', currentBennys);
  if (!isSpotFree) return;

  const vehConfig = await getVehicleConfig(plyVeh);

  let currentSpotData: Pick<Bennys.Location, 'vector' | 'heading' | 'vehicleType'> | undefined =
    locations[currentBennys];
  if (!currentSpotData) {
    currentSpotData = {
      vector: Util.getPlyCoords(),
      heading: GetEntityHeading(PlayerPedId()),
      vehicleType: vehConfig?.type ?? 'land',
    };
  }

  if (!vehConfig || (currentSpotData && currentSpotData.vehicleType !== vehConfig.type)) return;

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

  const currentUpgrades = upgradesManager.get('cosmetic', plyVeh);
  if (!currentUpgrades) return;

  const repairData = getRepairData(plyVeh);
  const entered = await RPC.execute<boolean>(
    'vehicles:bennys:enterSpot',
    currentBennys,
    NetworkGetNetworkIdFromEntity(plyVeh),
    currentUpgrades,
    repairData
  );
  if (!entered) {
    FreezeEntityPosition(plyVeh, false);
    return;
  }

  equippedUpgradesOnEnter = currentUpgrades;
  modelStanceData = (await RPC.execute('vehicles:stance:getModelData', GetEntityModel(plyVeh))) ?? [];
  originalStance = getAppliedStance(plyVeh);
  blockedUpgrades =
    (await RPC.execute<Partial<Record<Vehicles.Upgrades.Cosmetic.Key, number[]>>>(
      'vehicles:bennys:getBlockedUpgrades',
      GetEntityModel(plyVeh) >>> 0
    )) ?? {};
  bennysMenuOpen = true;

  UI.hideInteraction();
  setEngineState(plyVeh, false, true);
  DisplayRadar(false);
  startKeyThread();

  UI.openApplication(
    'bennys',
    {
      repairCost: repairData?.price ?? null,
    },
    true
  );
  UI.SetUIFocusCustom(true, false);
};
