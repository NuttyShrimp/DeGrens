import { Events, Jobs, Notifications, Peek, UI, Util, Weapons } from '@dgx/client';
import { getCurrentLocation, onEnterHeistLocation, onLeaveHeistLocation } from 'services/locations';
import {
  buildVitrineZones,
  destroyVitrineZones,
  getInteractPositionOfVitrine,
  loadAllVitrineOverrides,
  lootVitrine,
  restoreAllVitrineModels,
  setVitrineOverrideModel,
  toggleAlarm,
} from './service.jewelry';
import { WHITELISTED_WEAPONS } from './constants.jewelry';

onEnterHeistLocation(locationId => {
  if (locationId !== 'jewelry') return;
  buildVitrineZones();
  loadAllVitrineOverrides();
});

onLeaveHeistLocation(locationId => {
  if (locationId !== 'jewelry') return;
  destroyVitrineZones();
  restoreAllVitrineModels();
});

Peek.addFlagEntry('isJewelryStart', {
  options: [
    {
      label: 'Koop SD Kaartje',
      icon: 'fas fa-sd-card',
      action: () => {
        Events.emitNet('heists:jewelry:buyCard');
      },
    },
    {
      label: 'Koop Info',
      icon: 'fas fa-circle-info',
      action: () => {
        Events.emitNet('heists:jewelry:buyInfo');
      },
      canInteract: () => !Jobs.getCurrentJob().name,
    },
  ],
});

Peek.addFlagEntry('isJewelryLaptop', {
  options: [
    {
      label: 'Lees SD Kaartje',
      icon: 'fas fa-sd-card',
      items: 'jewelry_sd_card',
      action: () => {
        Events.emitNet('heists:jewelry:useCard');
      },
    },
  ],
});

Peek.addZoneEntry('jewelry_vitrine', {
  options: [
    {
      label: 'Openbreken',
      icon: 'fas fa-hammer-crash',
      action: option => {
        lootVitrine(option.data.id);
      },
      canInteract: (_, __, option) => {
        if (getCurrentLocation() !== 'jewelry') return false;
        const curWeapon = Weapons.getCurrentWeaponData()?.name;
        if (!curWeapon || !WHITELISTED_WEAPONS.includes(curWeapon)) return false;
        const interactCoords = getInteractPositionOfVitrine(option.data.id);
        return Util.getPlyCoords().distance(interactCoords) < 1;
      },
    },
  ],
});

Peek.addModelEntry('prop_keyboard_01a', {
  options: [
    {
      label: 'Pincode Invoeren',
      icon: 'fas fa-keyboard',
      action: () => {
        Events.emitNet('heists:jewelry:overrideAlarm');
      },
      canInteract: () => {
        return getCurrentLocation() === 'jewelry';
      },
    },
  ],
});

Peek.addFlagEntry('isJewelryReset', {
  options: [
    {
      label: 'Scuff Reset',
      icon: 'fas fa-ban',
      action: async () => {
        const result = await UI.openInput<{ input: string }>({
          header: `Gebruik dit enkel wanneer je binnen door scuff redenen vast zit.\nDit zal de deuren openen.\nGebruik hiervan wordt gelogged en misbruik zal gevolgen hebben. Gelieve ook spontaan een ticket te maken met de reden zodat dit bekeken kan worden door de developers.`,
          inputs: [
            {
              type: 'text',
              name: 'input',
              label: `Typ: 'CONFIRM' om te bevestigen.`,
            },
          ],
        });
        if (!result.accepted) return;
        if (result.values.input !== 'CONFIRM') return;
        Notifications.add('Reset geconfirmeerd', 'success');
        Events.emitNet('heists:jewelry:resetScuff');
      },
      canInteract: () => getCurrentLocation() === 'jewelry',
    },
  ],
});

Events.onNet('heists:jewelry:toggleAlarm', toggleAlarm);
Events.onNet('heists:jewelry:smashVitrine', (vitrineId: number) => {
  setVitrineOverrideModel(vitrineId, true);
});
