import { Events, Peek, Weapons, Phone } from '@dgx/client';
import { Util } from '@dgx/shared';
import { activateLocation, deactivateLocation, enterHouse, leaveHouse } from './service.house';
import { getInsideHouseId } from 'modules/interior/service.interior';

let selectedHouseId: string | null = null;
let radiusBlip: number | null = null;
let radiusBlipInterval: NodeJS.Timer | null = null;

global.exports('lootZone', (zoneName: string, lootTableId = 0) => {
  const houseId = getInsideHouseId();
  if (!houseId) return;
  Events.emitNet('houserobbery:server:doLootZone', houseId, zoneName, lootTableId);
});

on('dg-houserobbery:leave', leaveHouse);

Events.onNet('houserobbery:client:cleanup', () => {
  selectedHouseId = null;
  if (radiusBlipInterval) {
    clearInterval(radiusBlipInterval);
    radiusBlipInterval = null;
  }
  if (radiusBlip !== null) {
    RemoveBlip(radiusBlip);
    radiusBlip = null;
  }
});

Peek.addFlagEntry('isHouseRobSignin', {
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
});

Peek.addZoneEntry('houserobbery_door', {
  options: [
    {
      icon: 'fas fa-lock-open',
      label: 'Forceer deur',
      action: option => {
        const holdingCrowbar = Weapons.getCurrentWeaponData()?.name === 'weapon_crowbar' ?? false;
        Events.emitNet('houserobbery:server:unlockHouse', option.data.id, holdingCrowbar);
      },
      canInteract: (_, __, option) => {
        return selectedHouseId == option.data.id;
      },
    },
    {
      icon: 'fas fa-door-open',
      label: 'Ga binnen',
      action: entry => {
        enterHouse(entry.data.id);
      },
      canInteract: (_, __, option) => {
        if (selectedHouseId === null) return true;
        return option.data.id === selectedHouseId;
      },
    },
    {
      icon: 'fas fa-lock',
      label: 'Vergrendel deur',
      job: 'police',
      action: option => {
        Events.emitNet('houserobbery:server:lockDoor', option.data.id);
      },
    },
  ],
  distance: 1.5,
});

Events.onNet('houserobbery:client:activateLocation', activateLocation);
Events.onNet('houserobbery:client:deactivateLocation', deactivateLocation);

Events.onNet('houserobbery:client:setSelectedHouse', (houseId: string, coords: Vec4, timeToFind: number) => {
  selectedHouseId = houseId;

  let blipAlpha = 150;
  radiusBlip = AddBlipForRadius(
    coords.x + Util.getRndInteger(-25, 25),
    coords.y + Util.getRndInteger(-25, 25),
    coords.z,
    50.0
  );
  SetBlipColour(radiusBlip, 1);
  SetBlipAlpha(radiusBlip, blipAlpha);
  SetBlipHighDetail(radiusBlip, true);

  radiusBlipInterval = setInterval(() => {
    if (radiusBlip === null) return;
    if (blipAlpha === 0) {
      if (radiusBlipInterval) {
        clearInterval(radiusBlipInterval);
        radiusBlipInterval = null;
      }
      RemoveBlip(radiusBlip);
      return;
    }
    blipAlpha--;
    SetBlipAlpha(radiusBlip, blipAlpha);
  }, (timeToFind * 60000) / 150);

  Phone.addMail({
    subject: 'Huisinbraak',
    sender: 'Bert B.',
    message: `Je bent geselecteerd voor de job. Je hebt ${timeToFind}min om binnen te geraken! De locatie staat op je GPS gemarkeerd.`,
  });
});
