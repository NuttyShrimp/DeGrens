import { Util } from '@dgx/server';
import { Vector3 } from '@dgx/shared';

import { getGarageById } from '../service.garages';

export class GarageThread {
  private thread: NodeJS.Timer | null;
  private currentGarage: Vehicles.Garages.Garage | null;
  private currentSpot: Vehicles.Garages.ParkingSpot | null;
  private nearGarageSpot = false;
  private source: string;
  private garageId: string;

  constructor(src: number, garageId: string) {
    this.thread = null;
    this.currentGarage = null;
    this.currentSpot = null;
    this.source = String(src);
    this.garageId = garageId;
  }

  getNearestSpot(coords: Vector3): Vehicles.Garages.ParkingSpot | null {
    let nearestSpot: Vehicles.Garages.ParkingSpot | null = null;
    let nearestDist: number | null = null;
    this.currentGarage?.parking_spots.forEach(spot => {
      const spotVector = new Vector3(spot.coords.x, spot.coords.y, spot.coords.z);
      const dist = spotVector.subtract(coords).Length;
      if (dist < spot.size + spot.distance) {
        if (nearestDist === null || dist < nearestDist) {
          nearestDist = dist;
          nearestSpot = spot;
        }
      }
    });
    return nearestSpot;
  }

  start() {
    this.currentGarage = getGarageById(this.garageId);
    if (!this.currentGarage) {
      return;
    }
    const ped = GetPlayerPed(this.source);
    this.thread = setInterval(() => {
      if (!this.currentGarage) {
        if (this.thread) {
          clearInterval(this.thread);
        }
      }
      const plyCoords = Util.getEntityCoords(ped);
      this.currentSpot = this.getNearestSpot(plyCoords);
      if (!this.currentSpot) {
        if (this.nearGarageSpot) {
          this.nearGarageSpot = false;
          emitNet('dg-ui:closeApplication', this.source, 'interaction');
          if (Util.isDevEnv()) {
            emitNet('vehicles:dev:currentSpot', this.source, null);
          }
        }
        return;
      }
      if (!this.nearGarageSpot) {
        this.nearGarageSpot = true;
        emitNet(
          'dg-ui:openApplication',
          this.source,
          'interaction',
          {
            text: 'Parking',
            type: 'info',
          },
          true
        );
        if (Util.isDevEnv()) {
          emitNet('vehicles:dev:currentSpot', this.source, this.currentSpot);
        }
      }
    }, 250);
  }

  stop() {
    if (this.thread) {
      clearInterval(this.thread);
    }
    emitNet('dg-ui:closeApplication', this.source, 'interaction');
  }

  isNearGarageSpot() {
    return this.nearGarageSpot;
  }

  getCurrentParkingSpot() {
    return this.currentSpot;
  }

  getGarage() {
    return this.currentGarage;
  }
}
