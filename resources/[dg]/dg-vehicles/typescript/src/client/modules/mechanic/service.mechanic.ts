import { Events, Notifications, RPC, Taskbar, UI, Util } from '@dgx/client';
import { getVehHalfLength, getVehicleVinWithoutValidation } from '@helpers/vehicle';

import { itemInputBase, valueToLabel } from '../../../shared/constant.mechanic';

let clockedIn: string | null = null;
let repairZone: string | null = null;

let order: Mechanic.Tickets.Item[] = [];

export const isClockedIn = () => !!clockedIn;

// Returns the shop where the player is in and clocked in (if the same)
export const getCurrentWorkingShop = () => {
  if (!clockedIn) return;
  return clockedIn == repairZone ? clockedIn : undefined;
};

export const setClockInStatus = (pClockedIn: boolean, shop: string) => {
  clockedIn = pClockedIn ? shop : null;
  Notifications.add(clockedIn ? 'Je hebt juist ingeclocked' : 'Je bent juist uitgeclocked');
  Events.emitNet('vehicles:mechanic:setClockStatus', shop, pClockedIn);
};

export const setRepairZone = (zone: string | null) => {
  repairZone = zone;
};

// region Item order
export const openItemOrder = () => {
  // opens contextmenu with current order
  // Can add extra items via input with options for
  // Item
  // Class
  // Amount
  const menu: ContextMenu.Entry[] = [
    {
      title: 'Add part',
      icon: 'plus',
      submenu: [
        {
          title: 'Repair Part',
          callbackURL: 'vehicles/mechanic/addOrderRepairItem',
        },
        {
          title: 'Performance Part',
          callbackURL: 'vehicles/mechanic/addOrderPerformanceItem',
        },
      ],
    },
    {
      title: 'Reset order',
      icon: 'trash-can',
      submenu: [
        {
          title: 'Confirm',
          description: 'THIS CANNOT BE UNDONE',
          callbackURL: 'vehicles/mechanic/resetOrder',
        },
      ],
    },
    ...order.map(e => ({
      title: `${valueToLabel[e.part]} ${valueToLabel[e.type]} ${e.class}`,
      description: `Amount: ${e.amount}`,
      submenu: [
        {
          title: 'Remove from order',
          icon: 'trash-can',
          data: e,
          callbackURL: 'vehicles/mechanic/removeFromOrder',
        },
      ],
    })),
  ];
  if (order.length > 0) {
    menu.push({
      title: 'Finish order',
      submenu: [
        {
          title: 'Confirm',
          callbackURL: 'vehicles/mechanic/finishOrder',
        },
      ],
    });
  }
  UI.openApplication('contextmenu', menu);
};

export const openPerfomanceItemOrderInput = async () => {
  const { accepted, values } = await UI.openInput({
    header: 'Add performance item to order',
    inputs: [
      {
        name: 'type',
        type: 'select',
        label: 'Item Type',
        value: 'upgrade_1',
        options: [
          {
            label: 'Stage 1 Upgrade',
            value: 'upgrade_1',
          },
          {
            label: 'Stage 2 Upgrade',
            value: 'upgrade_2',
          },
          {
            label: 'Stage 3 Upgrade',
            value: 'upgrade_3',
          },
        ],
      },
      {
        name: 'part',
        type: 'select',
        label: 'Vehicle Part',
        options: [
          {
            label: 'Brakes',
            value: 'brakes',
          },
          {
            label: 'Engine',
            value: 'engine',
          },
          {
            label: 'Suspension',
            value: 'suspension',
          },
          {
            label: 'Transmission',
            value: 'transmission',
          },
        ],
      },
      ...itemInputBase,
      {
        type: 'display',
        name: 'stashAmount',
        label: 'Stash hoeveelheid',
        getEndpoint: 'vehicles/mechanic/getStashPerformanceAmount',
      },
    ],
  });
  if (!accepted) {
    Notifications.add('Item niet aan order toegevoegd...', 'error');
    return;
  }
  const item = order.find(e => e.class === values.class && e.type === values.type && e.part === values.part);
  if (item) {
    item.amount += Number(values.amount);
  } else {
    order.push({
      type: values.type as Exclude<Mechanic.Tickets.ItemType, 'repair'>,
      part: values.part as Mechanic.Tickets.PerformanceItemPart,
      amount: Number(values.amount),
      class: values.class as CarClass,
    });
  }
  Notifications.add(`Item added to order`);
  openItemOrder();
};

export const openRepairItemOrderInput = async () => {
  const { accepted, values } = await UI.openInput({
    header: 'Add repair item to order',
    inputs: [
      {
        name: 'part',
        type: 'select',
        label: 'Vehicle Part',
        options: [
          {
            label: 'Axle',
            value: 'axle',
          },
          {
            label: 'Brakes',
            value: 'brakes',
          },
          {
            label: 'Engine',
            value: 'engine',
          },
          {
            label: 'Suspension',
            value: 'suspension',
          },
        ],
      },
      ...itemInputBase,
      {
        type: 'display',
        name: 'stashAmount',
        label: 'Stash hoeveelheid',
        getEndpoint: 'vehicles/mechanic/getStashRepairAmount',
      },
    ],
  });
  if (!accepted) {
    Notifications.add('Item niet aan order toegevoegd...', 'error');
    return;
  }
  const item = order.find(e => e.class === values.class && e.type === values.type && e.part === values.part);
  if (item) {
    item.amount += Number(values.amount);
  } else {
    order.push({
      type: 'repair',
      part: values.part as Mechanic.Tickets.RepairItemPart,
      amount: Number(values.amount),
      class: values.class as CarClass,
    });
  }
  Notifications.add(`Item added to order`);
  openItemOrder();
};

export const removeItem = (item: Mechanic.Tickets.Item) => {
  order = order.filter(e => e.class !== item.class || e.type !== item.type || e.part !== item.part);
};

export const clearItemOrder = () => {
  order = [];
};

export const finishOrder = () => {
  Events.emitNet('vehicles:mechanic:server:itemOrder', order);
};

export const getAmountOfItemInStash = async (
  type?: Mechanic.Tickets.ItemType,
  part?: Mechanic.Tickets.RepairItemPart | Mechanic.Tickets.PerformanceItemPart,
  partClass?: CarClass
) => {
  if (!type || !part || !partClass) return 0;
  // Just shut up
  // @ts-ignore
  const item: Mechanic.Tickets.Item = {
    type,
    part,
    class: partClass,
    amount: 0,
  };
  return await RPC.execute('vehicles:mechanic:server:getStashAmount', item);
};

// endregion

// region Vehicle Tow
let towVehicle: number;
let modelOffsets: Record<string, Vec3> = {};
let jobBlip: number;
let jobVin: string | null = null;

const getOffset = (veh: number) => {
  for (const model in modelOffsets) {
    if (GetEntityModel(veh) == GetHashKey(model)) {
      return modelOffsets[model];
    }
  }
};

export const setTowOffsets = (offset: Record<string, Vec3>) => {
  modelOffsets = offset;
};

export const canTow = (veh: number) => {
  if (!towVehicle || towVehicle === veh) return false;
  if (!isClockedIn()) return false;
  // Vehicle should be in half circle of a const radius behind towVehicle
  const towVehLength = getVehHalfLength(towVehicle);
  const towVehBackPos = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(veh, 0, -towVehLength, 0));
  // front/back of veh should be in radius of 3 from towVehBackPos
  const vehToTowLength = getVehHalfLength(veh);
  const vehToTowFront = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(veh, 0, vehToTowLength, 0));
  const vehToTowBack = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(veh, 0, -vehToTowLength, 0));
  const distToFront = towVehBackPos.distance(vehToTowFront);
  const distToBack = towVehBackPos.distance(vehToTowBack);
  return distToFront < 3 || distToBack < 3;
};

export const takeHook = (veh: number) => {
  towVehicle = veh;
  Notifications.add('Sleephaak vastgepakt');
};

export const attachHook = async (vehToTow: number) => {
  if (!canTow(vehToTow)) {
    Notifications.add('Ge hebt gene haak vast', 'error');
    return;
  }
  if (vehToTow === towVehicle) {
    Notifications.add('Ge kunt nie u eigen voertuig takelen...', 'error');
    return;
  }
  const offset = getOffset(towVehicle);
  if (!offset) return;
  const [cancelled] = await Taskbar.create('truck-tow', 'Voertuig vasthangen', 15000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    controlDisables: {
      movement: true,
    },
    animation: {
      animDict: 'missexile3',
      anim: 'ex03_dingy_search_case_a_michael',
      flags: 1,
    },
  });
  if (cancelled) {
    Notifications.add('Geannulleerd...', 'error');
    return;
  }
  const vin = Entity(vehToTow).state?.vin;
  if (vin && vin != jobVin) {
    finishJob();
  }
  Entity(towVehicle).state.set('vehicleAttached', NetworkGetNetworkIdFromEntity(vehToTow), true);
  const [vehToTowDimMin, vehToTowDimMax] = GetModelDimensions(GetEntityModel(vehToTow));
  const zOffset = (vehToTowDimMax[2] - vehToTowDimMin[2]) / 2;
  AttachEntityToEntity(
    vehToTow,
    towVehicle,
    GetEntityBoneIndexByName(towVehicle, 'bodyshell'),
    offset.x,
    offset.y,
    offset.z + zOffset,
    0,
    0,
    0,
    true,
    true,
    false,
    true,
    0,
    true
  );
  FreezeEntityPosition(vehToTow, true);
  towVehicle = 0;
};

export const hasVehicleAttached = (towVeh: number) => {
  return !!Entity(towVeh).state.vehicleAttached;
};

export const assignJob = (vin: string, coords: Vec3) => {
  jobVin = vin;
  jobBlip = AddBlipForCoord(coords.x, coords.y, coords.z);
  SetBlipColour(jobBlip, 3);
  SetBlipRoute(jobBlip, true);
  SetBlipRouteColour(jobBlip, 3);
};

export const isDoingAJob = (ent: number) => {
  const vin = getVehicleVinWithoutValidation(ent);
  if (!vin) return false;
  return vin === jobVin;
};

export const finishJob = () => {
  if (DoesBlipExist(jobBlip)) {
    RemoveBlip(jobBlip);
    jobBlip = 0;
    jobVin = null;
  }
};

export const releaseVehicle = async (towVeh: number) => {
  if (!hasVehicleAttached(towVeh)) return;
  const [cancelled] = await Taskbar.create('truck-tow', 'Voertuig loslaten', 15000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    controlDisables: {
      movement: true,
    },
    animation: {
      animDict: 'missexile3',
      anim: 'ex03_dingy_search_case_a_michael',
      flags: 1,
    },
  });
  if (cancelled) {
    Notifications.add('Geannulleerd...', 'error');
    return;
  }
  const attachedVehNetId = Entity(towVeh).state.vehicleAttached;
  const attachedVeh = NetworkGetEntityFromNetworkId(attachedVehNetId);
  FreezeEntityPosition(towVeh, false);
  // Do some math magic
  const [towDimMin, towDimMax] = GetModelDimensions(GetEntityModel(towVeh));
  const [targetDimMin, targetDimMax] = GetModelDimensions(GetEntityModel(towVeh));
  await Util.Delay(10);
  const dropYPos = ((towDimMax[1] - towDimMin[1]) / 2 + (targetDimMax[1] - targetDimMin[1]) / 2 + 1) * -1;
  AttachEntityToEntity(
    attachedVeh,
    towVeh,
    GetEntityBoneIndexByName(attachedVeh, 'bodyshell'),
    0.0,
    dropYPos,
    0.0,
    0.0,
    0.0,
    0.0,
    false,
    false,
    false,
    false,
    20,
    true
  );
  DetachEntity(attachedVeh, true, true);
  Events.emitNet('vehicles:server:setOnGround', attachedVehNetId);
  Notifications.add('Voertuig is losgelaten');
  Entity(towVeh).state.set('vehicleAttached', null, true);
};
// endregion
