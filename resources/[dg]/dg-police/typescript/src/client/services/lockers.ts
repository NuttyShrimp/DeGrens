import { Inventory, UI, Util } from '@dgx/client';

let lockers: Vec3[] = [];

export const loadLockers = (config: Vec3[]) => {
  lockers = config;
};

global.exports('isAtLocker', () => {
  const plyCoords = Util.getPlyCoords();
  return lockers.some(l => plyCoords.distance(l) < 3);
});

on('police:openLocker', async () => {
  const result = await UI.openInput({
    header: 'Open Bewijskast',
    inputs: [
      {
        type: 'text',
        label: 'Lockernummer',
        name: 'number',
      },
    ],
  });
  if (!result.accepted) return;

  const stashId = `police_locker_${result.values.number}`;
  Inventory.openStash(stashId, 50);
});
