import { Events, Minigames, Notifications, RPC, Taskbar, UI } from '@dgx/client';
import { attachBox, removeBox } from 'services/box';

let hasPackage = false;
let changeSettingsData: { labId: number; stationId: number } | null = null;

export const hasMethPackage = () => hasPackage;

export const takeMethPackage = async (labId: number) => {
  const isStarted = await RPC.execute<boolean>('labs:meth:isStarted', labId);
  if (!isStarted) {
    Notifications.add('Lab staat nog niet aan', 'error');
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

  hasPackage = true;
  attachBox();
};

export const removeMethPackage = () => {
  removeBox();
  hasPackage = false;
};

export const increaseMethStatus = async (labId: number, stationId: number) => {
  if (!hasPackage) {
    Notifications.add('Je hebt geen pakketje vast', 'error');
    return;
  }

  const canFill = await RPC.execute<'full' | 'notFull' | 'notStarted'>('labs:meth:canFillStation', labId, stationId);
  if (canFill === 'notStarted') {
    Notifications.add('Dit staat nog niet aan', 'error');
    return;
  }
  if (canFill === 'full') {
    Notifications.add('Dit zit al vol...', 'error');
    return;
  }

  hasPackage = false;
  removeBox();

  const success = await Minigames.keygame(5, 7, 10);
  if (!success) return;

  const [canceled] = await Taskbar.create('fill', 'Vullen...', 10000, {
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
      flags: 0,
    },
  });
  if (canceled) return;

  Events.emitNet('labs:meth:increaseStationAmount', labId, stationId);
};

export const setMethSettings = async (labId: number, stationId: number) => {
  if (changeSettingsData !== null) {
    Notifications.add('Je bent nog bezig met ingeven', 'error');
    return;
  }

  const isStarted = await RPC.execute<boolean>('labs:meth:isStarted', labId);
  if (!isStarted) {
    Notifications.add('Lab staat nog niet aan', 'error');
    return;
  }

  if (hasPackage) {
    Notifications.add('Je hebt je handen vol', 'error');
    return;
  }

  const [canceled] = await Taskbar.create('gears', 'Instellen...', 3000, {
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
      animDict: 'anim@amb@business@meth@meth_monitoring_cooking@monitoring@',
      anim: 'button_press_monitor',
      flags: 16,
    },
  });
  if (canceled) return;

  changeSettingsData = { labId, stationId };

  const stationSettings = await RPC.execute<Labs.Meth.Settings>('labs:meth:getStationSettings', labId, stationId);
  if (!stationSettings) return;

  UI.openApplication('sliders', stationSettings);
};

export const setMethStationSettings = (settings: Labs.Meth.Settings) => {
  if (changeSettingsData === null) return;

  const { labId, stationId } = changeSettingsData;
  Events.emitNet('labs:meth:setStationSettings', labId, stationId, settings);
  changeSettingsData = null;
};
