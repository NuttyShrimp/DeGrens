import { BaseEvents, Events, PropAttach, Taskbar } from '@dgx/client';

let scubagearEquipped = false;
let propIds: number[] | null = null;

let maxUnderwaterTime = 10;

export const getMaxUnderwaterTime = () => maxUnderwaterTime;

Events.onNet('misc:scubagear:toggle', async () => {
  const [canceled] = await Taskbar.create('mask-snorkel', '', 20000, {
    canCancel: true,
    cancelOnDeath: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      combat: true,
      carMovement: true,
    },
    animation: {
      animDict: 'clothingshirt',
      anim: 'try_shirt_positive_d',
      flags: 49,
    },
  });
  if (canceled) return;

  scubagearEquipped = !scubagearEquipped;

  if (propIds) {
    propIds.forEach(propId => {
      PropAttach.remove(propId);
    });
    propIds = null;
  }

  if (scubagearEquipped) {
    propIds = [PropAttach.add('scubagear_mask'), PropAttach.add('scubagear_tank')];
  }

  const ped = PlayerPedId();

  maxUnderwaterTime = scubagearEquipped ? 50 : 10;
  SetPedMaxTimeUnderwater(ped, maxUnderwaterTime);
  SetEnableScuba(ped, scubagearEquipped);
});

BaseEvents.onPedChange(() => {
  const ped = PlayerPedId();
  SetPedMaxTimeUnderwater(ped, maxUnderwaterTime);
});
