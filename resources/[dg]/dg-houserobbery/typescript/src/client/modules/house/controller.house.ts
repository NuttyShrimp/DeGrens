import { Events, Notifications, Peek, PolyTarget, RPC } from '@dgx/client';
import { Util } from '@dgx/shared';

import { enterHouse, leaveHouse, lockHouse, searchLootLocation, unlockHouse } from './helpers.house';

let shellTypes: Record<string, string>;

let selectedHouse: string | null = null;
let selectedHouseInfo: House.Data | null = null;
let radiusBlip: any = null;
let radiusBlipInterval: NodeJS.Timer | null = null;

export const getShellTypes = () => shellTypes;
export const getSelectedHouse = () => selectedHouse;
export const setSelectedHouse = (houseId: string) => { selectedHouse = houseId };
export const getSelectedHouseInfo = () => selectedHouseInfo;

global.exports('lootZone', (place: string, lootTable?: number) => {
  if (!selectedHouse) return;
  searchLootLocation(selectedHouse, place, lootTable);
});

Events.onNet('houserobbery:server:setShellTypes', (types: typeof shellTypes) => {
  shellTypes = types;
});

on('dg-houserobbery:leave', () => {
  if (!selectedHouse) return;
  leaveHouse();
});

onNet('houserobbery:client:cleanup', () => {
  selectedHouse = null;
  selectedHouseInfo = null;
  if (radiusBlipInterval) {
    clearInterval(radiusBlipInterval);
    radiusBlipInterval = null;
  }
  RemoveBlip(radiusBlip);
});

Peek.addFlagEntry(
  'isHouseRobSignin',
  {
    options: [
      {
        icon: 'fas fa-pen',
        label: 'Meld aan/uit',
        items: ['vpn'],
        action: async () => {
          Events.emitNet('houserobbery:server:toggleSignedIn');
        },
      },
    ],
    distance: 1.5,
  },
  true
);

Peek.addZoneEntry(
  'houserobbery_door',
  {
    options: [
      {
        icon: 'fas fa-lock-open',
        label: 'Forceer deur',
        action: entry => {
          unlockHouse(entry.data.id);
        },
        canInteract: (_, __, entry) => {
          return selectedHouse == entry.data.id;
        },
      },
      {
        icon: 'fas fa-door-open',
        label: 'Ga binnen',
        action: entry => {
          enterHouse(entry.data.id);
        },
        canInteract: (_, __, entry) => {
          return selectedHouse == entry.data.id;
        },
      },
      {
        icon: 'fas fa-door-open',
        label: 'Ga binnen',
        job: 'police',
        action: entry => {
          enterHouse(entry.data.id);
        },
      },
      {
        icon: 'fas fa-lock',
        label: 'Vergrendel deur',
        job: 'police',
        action: entry => {
          lockHouse(entry.data.houseId);
        },
      },
    ],
    distance: 1.5,
  },
  true
);

Events.onNet('houserobbery:client:buildHouseZone', (houseId: string, houseInfo: House.Data) => {
  PolyTarget.addBoxZone('houserobbery_door', houseInfo.coords, 1.0, 1.0, {
    data: {
      id: houseId,
    },
    heading: houseInfo.coords.w,
    minZ: houseInfo.coords.z - 2,
    maxZ: houseInfo.coords.z + 2,
  });
});

Events.onNet('houserobbery:client:destroyHouseZone', (houseId: string) => {
  PolyTarget.removeZone('houserobbery_door', houseId);
});

Events.onNet('houserobbery:client:setSelectedHouse', (houseId: string, houseInfo: House.Data, timeToFind: number) => {
  selectedHouse = houseId;
  selectedHouseInfo = houseInfo;

  const coords = {
    x: houseInfo.coords.x + Util.getRndInteger(0, 50),
    y: houseInfo.coords.y + Util.getRndInteger(0, 50),
    z: houseInfo.coords.z,
  };
  let blipAlpha = 150;
  radiusBlip = AddBlipForRadius(coords.x, coords.y, coords.z, 100.0);
  SetBlipColour(radiusBlip, 1);
  SetBlipAlpha(radiusBlip, blipAlpha);
  SetBlipHighDetail(radiusBlip, true);

  radiusBlipInterval = setInterval(() => {
    if (blipAlpha == 0) {
      if (radiusBlipInterval) {
        clearInterval(radiusBlipInterval);
        radiusBlipInterval = null;
      }
      RemoveBlip(radiusBlip);
      selectedHouse = null;
      return;
    }
    blipAlpha--;
    SetBlipAlpha(radiusBlip, blipAlpha);
  }, (timeToFind * 60000) / 150);
});
