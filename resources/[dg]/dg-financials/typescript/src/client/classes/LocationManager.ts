import { Events, PolyZone, Util } from '@dgx/client';

import { config } from '../config';

import { Location } from './Location';

class LocationManager extends Util.Singleton<LocationManager>() {
  locations: Location[] = [];
  currentLocation: Location | null = null;
  atATM = false;

  public initLocation() {
    config.location.list.forEach(l => {
      PolyZone.addBoxZone(
        'bank',
        l.center,
        config.location.length,
        config.location.width,
        {
          data: {
            id: l.id,
          },
          heading: l.heading,
          minZ: l.center.z - 1,
          maxZ: l.center.z + 3,
        },
        true
      );
      this.locations.push(new Location(l.center, l.name, l.id));
    });
  }

  public setLocation(locName: string | null) {
    if (locName === null) {
      this.currentLocation!.setActive(false);
      this.currentLocation = null;
      global.exports['dg-ui'].hideInteraction();
      Events.emitNet('financials:location:set', null);
      return;
    }
    this.currentLocation = this.locations.find(l => l.getId() === locName && !l.isDisabled()) ?? null;
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
    if (!this.currentLocation) return;
    this.currentLocation.openMenu();
  }
}

const locationManager = LocationManager.getInstance();
export default locationManager;
