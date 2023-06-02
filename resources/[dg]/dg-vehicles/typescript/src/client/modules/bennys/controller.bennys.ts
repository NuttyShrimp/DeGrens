import { BlipManager, Events, Keys, PolyZone, UI } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

import { getCurrentVehicle, getVehicleConfig, isDriver } from '../../helpers/vehicle';

import {
  closeUI,
  enterBennys,
  getCurrentBennys,
  getOriginalStance,
  setBennysMenuOpen,
  setCurrentBennys,
  setLocations,
} from './service.bennys';

// Load benny locations
Events.onNet('vehicles:bennys:load', (locations: Bennys.Location[]) => {
  locations.forEach(l => {
    PolyZone.addBoxZone('benny', l.vector, l.width, l.length, {
      ...l.data,
      data: {
        id: l.name,
        type: l.vehicleType,
      },
      heading: l.heading,
    });
    if (!l.hideBlip) {
      BlipManager.addBlip({
        category: 'dg-vehicles',
        id: `vehicleshop-${l.name}`,
        text: `Benny's Motorworks`,
        coords: l.vector,
        sprite: 72,
        color: 0,
        scale: 0.8,
        display: 2,
      });
    }
  });
  setLocations(locations);
  console.log(`[Bennys] Loaded ${locations.length} locations`);
});

PolyZone.onEnter<{ id: string; type: Vehicle.VehicleType }>('benny', async (_, data) => {
  setCurrentBennys(data.id);
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) return;
  const vehConfig = await getVehicleConfig(veh);
  if (!vehConfig || (data.type && data.type !== vehConfig.type)) return;
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Bennys`);
});

PolyZone.onLeave('benny', () => {
  setCurrentBennys(null);
  UI.closeApplication('interaction');
});

Keys.onPressDown('GeneralUse', () => {
  enterBennys();
});

UI.onUIReload(() => {
  const currentBennys = getCurrentBennys();
  if (currentBennys !== null) {
    Events.emitNet('vehicles:bennys:resetVehicle', getCurrentBennys());
  }
  closeUI();
  setBennysMenuOpen(false);
  const veh = getCurrentVehicle();
  if (veh) {
    Entity(veh).state.set('stance', getOriginalStance(), true);
  }
});

Events.onNet('vehicles:bennys:adminEnter', () => {
  enterBennys(true);
});

// Reset currentBennys on close if current one is from adminmenu
UI.onApplicationClose(() => {
  const curBennys = getCurrentBennys();
  if (curBennys && curBennys.includes('admin')) {
    setTimeout(() => {
      setCurrentBennys(null);
    }, 1000);
  }
}, 'bennys');
