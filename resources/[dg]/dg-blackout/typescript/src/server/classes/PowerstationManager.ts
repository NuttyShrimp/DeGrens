import { Util } from '@dgx/server';

import blackoutManager from './BlackoutManager';

class PowerstationManager extends Util.Singleton<PowerstationManager>() {
  private stations: boolean[];

  setupStations = (amount: number) => {
    this.stations = new Array(amount).fill(false);
  };

  isStationHit = (stationId: number) => {
    return this.stations[stationId];
  };

  setStationHit = (stationId: number) => {
    this.stations[stationId] = true;
    this.checkAllStations();
  };

  private checkAllStations = () => {
    const allHit = this.stations.every(station => station === true);
    if (!allHit) return;
    blackoutManager.state = true;
    setTimeout(() => {
      blackoutManager.state = false;
      this.stations.fill(false);
    }, 45 * 60 * 1000);
  };
}

const powerstationManager = PowerstationManager.getInstance();
export default powerstationManager;
