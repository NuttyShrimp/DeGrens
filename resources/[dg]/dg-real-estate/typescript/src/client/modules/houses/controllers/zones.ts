import { Events, Inventory, Keys, PolyZone, Sounds, Sync, UI } from '@dgx/client';
import { getCurrentHouse, getCurrentHouseCenter, leaveProperty } from '../services/instance';
import { getHouseInfo } from '../services/store';
import { Vector3 } from '@dgx/shared';

let activeZone: keyof Properties.PropertyLocations | null = null;

const LOCATION_KEYS: (keyof Properties.PropertyLocations)[] = ['stash', 'logout', 'clothing'];

LOCATION_KEYS.forEach(l => {
  PolyZone.onEnter(`real_estate_${l}`, () => {
    activeZone = l;
    UI.showInteraction(`[${Keys.getBindedKey('GeneralUse')}] - ${l}`);
  });

  PolyZone.onLeave(`real_estate_${l}`, () => {
    activeZone = null;
    UI.hideInteraction();
  });
});

Keys.onPressDown('GeneralUse', () => {
  if (!activeZone) return;
  switch (activeZone) {
    case 'stash': {
      openStash();
      break;
    }
    case 'logout': {
      leaveProperty();
      Events.emitNet('chars:server:logOut');
      break;
    }
    case 'clothing': {
      emit('qb-clothing:client:openOutfitMenu');
      break;
    }
  }
});

const openStash = () => {
  const houseName = getCurrentHouse();
  if (!houseName) return;
  Inventory.openStash(houseName);
  Sounds.playLocalSound('StashOpen', 1);
};

export const generateZones = () => {
  const houseName = getCurrentHouse();
  if (!houseName) return;
  const houseInfo = getHouseInfo(houseName);
  const houseCenter = getCurrentHouseCenter();
  if (!houseCenter) return;

  Object.keys(houseInfo.locations).forEach((l: string) => {
    const coords = houseInfo.locations[l as keyof Properties.PropertyLocations];
    if (!coords) return;
    PolyZone.addCircleZone(`real_estate_${l}`, Vector3.add(coords, houseCenter), 1.25, {
      useZ: true,
      data: {
        id: houseInfo.name,
      },
      routingBucket: Sync.getCurrentRoutingBucket(),
    });
  });
};

export const cleanupZones = () => {
  const houseName = getCurrentHouse();
  if (!houseName) return;
  const houseInfo = getHouseInfo(houseName);

  Object.keys(houseInfo.locations).forEach((l: string) => {
    const coords = houseInfo.locations[l as keyof Properties.PropertyLocations];
    if (!coords) return;
    PolyZone.removeZone(`real_estate_${l}`, houseInfo.name);
  });
};
