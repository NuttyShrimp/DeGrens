import { Events } from '@dgx/client';

import { config } from '../config';

import { Location } from './Location';

export class LocationManager {
  // region Instance management
  private static instance: LocationManager;
  locations: Location[] = [];
  // endregion
  currentLocation: Location = null;
  atATM = false;

  public static getInstance(): LocationManager {
    if (!LocationManager.instance) {
      LocationManager.instance = new LocationManager();
    }
    return LocationManager.instance;
  }

  public initLocation() {
    config.location.list.forEach(l => {
      global.exports['dg-polyzone'].AddBoxZone('bank', l.center, config.location.length, config.location.width, {
        data: {
          id: l.id,
        },
        heading: l.heading,
        minZ: l.center.z - 1,
        maxZ: l.center.z + 3,
      });
      this.locations.push(new Location(l.center, l.name, l.id));
    });
  }

  public setLocation(locName: string) {
    if (!locName) {
      this.currentLocation.setActive(false);
      this.currentLocation = null;
      global.exports['dg-ui'].hideInteraction();
      Events.emitNet('financials:location:set', null);
      return;
    }
    this.currentLocation = this.locations.find(l => l.getId() === locName && !l.isDisabled());
    if (this.currentLocation) {
      this.currentLocation.setActive(true);
      global.exports['dg-ui'].showInteraction(`[E] - bank`);
      Events.emitNet('financials:location:set', this.currentLocation.getId());
    }
  }

  public setAtATM(atATM: boolean) {
    this.atATM = atATM;
  }

  public isInALocation() {
    return this.currentLocation !== null || this.atATM;
  }

  public isAtAtm() {
    return this.atATM;
  }

  public openMenu() {
    if (this.currentLocation) {
      this.currentLocation.openMenu();
    }
  }
}
