import { Events, Keys, PolyZone, UI } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

import { getCurrentVehicle, isDriver } from '../../helpers/vehicle';

import {
  closeUI,
  enterBennys,
  getCurrentBennys,
  originalStance,
  setBennysMenuOpen,
  setCurrentBennys,
  setLocations,
} from './service.bennys';

// Load benny locations
Events.onNet('vehicles:bennys:load', (locations: Bennys.Location[]) => {
  locations.forEach(l => {
    PolyZone.addBoxZone(
      'benny',
      new Vector3(l.vector.x, l.vector.y, l.vector.z),
      l.width,
      l.length,
      {
        ...l.data,
        data: {
          id: l.name,
        },
        heading: l.heading,
      },
      true
    );
    const locBlip = AddBlipForCoord(l.vector.x, l.vector.y, l.vector.z);
    SetBlipSprite(locBlip, 72);
    SetBlipColour(locBlip, 0);
    SetBlipDisplay(locBlip, 2);
    SetBlipScale(locBlip, 0.8);
    SetBlipAsShortRange(locBlip, true);
    BeginTextCommandSetBlipName('STRING');
    AddTextComponentString("Benny's Motorworks");
    EndTextCommandSetBlipName(locBlip);
  });
  setLocations(locations);
  console.log(`[Bennys] Loaded ${locations.length} locations`);
});

PolyZone.onEnter('benny', (_, data) => {
  setCurrentBennys(data.id);
  if (!getCurrentVehicle() || !isDriver()) return;
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Bennys`);
});

PolyZone.onLeave('benny', () => {
  setCurrentBennys(null);
  UI.closeApplication('interaction');
  // This is a safety check
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) return;
});

Keys.onPressDown('GeneralUse', () => {
  enterBennys();
});

on('dg-ui:reload', () => {
  Events.emitNet('vehicles:bennys:resetVehicle', getCurrentBennys());
  closeUI();
  setBennysMenuOpen(false);
  const veh = getCurrentVehicle();
  if (veh) {
    Entity(veh).state.set('stance', originalStance, true);
  }
});

Events.onNet('vehicles:bennys:enter', () => {
  enterBennys(true);
});
