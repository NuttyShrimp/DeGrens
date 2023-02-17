import { Events, Taskbar } from '@dgx/client';

export const cutPlant = async (plantId: number) => {
  const [canceled] = await Taskbar.create('scissors', 'Bijknippen...', 10000, {
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
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 0,
    },
  });
  if (canceled) return;

  Events.emitNet('farming:plant:cut', plantId);
};

export const waterPlant = async (plantId: number) => {
  const [canceled] = await Taskbar.create('hand-holding-seedling', 'Water geven...', 10000, {
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
      animDict: 'timetable@gardener@filling_can',
      anim: 'gar_ig_5_filling_can',
      flags: 16,
    },
  });
  if (canceled) return;

  Events.emitNet('farming:plant:water', plantId);
};

export const feedPlant = async (plantId: number, deluxe: boolean) => {
  const [canceled] = await Taskbar.create('hand-holding-seedling', 'Voeden...', 10000, {
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
      animDict: 'timetable@gardener@filling_can',
      anim: 'gar_ig_5_filling_can',
      flags: 16,
    },
  });
  if (canceled) return;

  Events.emitNet('farming:plant:feed', plantId, deluxe);
};

export const harvestPlant = async (plantId: number) => {
  const [canceled] = await Taskbar.create('scissors', 'Oogsten...', 10000, {
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
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 0,
    },
  });
  if (canceled) return;

  Events.emitNet('farming:plant:harvest', plantId);
};
