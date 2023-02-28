import { Events, Notifications, Police, RPC, Taskbar } from '@dgx/client';
import { attachBox, removeBox } from 'services/box';

let hasFertilizer = false;

export const takeWeedFertilizer = async () => {
  if (!Police.canDoActivity('labs_weed')) {
    Notifications.add('De voeding is momenteel op', 'error');
    return;
  }

  const [canceled] = await Taskbar.create('box', 'Nemen...', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      combat: true,
      carMovement: true,
      movement: true,
    },
    animation: {
      animDict: 'anim@amb@business@weed@weed_inspecting_lo_med_hi@',
      anim: 'weed_crouch_checkingleaves_idle_01_inspector',
      flags: 0,
    },
  });

  if (canceled) return;

  hasFertilizer = true;
  attachBox();
};

export const removeWeedFertilizer = () => {
  hasFertilizer = false;
  removeBox();
  Notifications.add('Voeding weggelegd');
};

export const hasWeedFertilizer = () => hasFertilizer;

export const fertilizeWeedPlant = async (labId: number, plantId: number) => {
  if (!hasFertilizer) return;

  const canFertilize = await RPC.execute<boolean>('labs:weed:canFertilize', labId, plantId);
  if (!canFertilize) {
    Notifications.add('Deze plant is al gevoed', 'error');
    return;
  }

  removeBox();
  hasFertilizer = false;

  const [canceled] = await Taskbar.create('oil-can', 'Voeden...', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      combat: true,
      carMovement: true,
      movement: true,
    },
    animation: {
      animDict: 'timetable@gardener@filling_can',
      anim: 'gar_ig_5_filling_can',
      flags: 16,
    },
  });
  if (canceled) return;

  Events.emitNet('labs:weed:fertilize', labId, plantId);
  Notifications.add('Wacht tot de plant is volgroeid', 'success');
};

export const harvestWeedPlant = async (labId: number, plantId: number) => {
  const canFertilize = await RPC.execute<boolean>('labs:weed:canHarvest', labId, plantId);
  if (!canFertilize) {
    Notifications.add('Deze plant is nog niet volgroeid', 'error');
    return;
  }

  const [canceled] = await Taskbar.create('scissors', 'Oogsten...', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      combat: true,
      carMovement: true,
      movement: true,
    },
    animation: {
      animDict: 'anim@amb@business@weed@weed_inspecting_lo_med_hi@',
      anim: 'weed_crouch_checkingleaves_idle_01_inspector',
      flags: 0,
    },
  });
  if (canceled) return;

  Events.emitNet('labs:weed:harvest', labId, plantId);
  attachBox();
};

export const searchHarvestedWeed = async (labId: number) => {
  removeBox();

  const canSearch = await RPC.execute<boolean>('labs:weed:canSearch', labId);
  if (!canSearch) {
    Notifications.add('Je hebt nog niks geknipt', 'error');
    return;
  }

  const [canceled] = await Taskbar.create('magnifying-glass', 'Zoeken...', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      combat: true,
      carMovement: true,
      movement: true,
    },
    animation: {
      animDict: 'creatures@rottweiler@tricks@',
      anim: 'petting_franklin',
      flags: 0,
    },
  });
  if (canceled) return;

  Events.emitNet('labs:weed:search', labId);
};
