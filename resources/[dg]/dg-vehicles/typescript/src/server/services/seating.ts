import { Util } from '@dgx/server';

import { getVinForNetId } from '../helpers/vehicle';

class SeatingService extends Util.Singleton<SeatingService>() {
  private promises: { [vin: string]: { [seat: number]: { resolve: (e?: any) => void; reject: (e?: any) => void } } } =
    {};

  tryEnteringVeh(pSrc: number, pNetId: number, pSeat: number) {
    const vin = getVinForNetId(pNetId);
    if (!vin) return;
    const veh = NetworkGetEntityFromNetworkId(pNetId);
    if (!veh) return;
    if (!DoesEntityExist(veh)) return;
    if (GetVehicleDoorLockStatus(veh) === 2) return;
    if (!this.promises[vin]) this.promises[vin] = {};
    new Promise((resolve, reject) => {
      this.promises[vin][pSeat] = { resolve, reject };
    }).catch(() => {
      const ped = GetPlayerPed(String(pSrc));
      SetPedIntoVehicle(ped, pNetId, pSeat);
    });
    setTimeout(() => {
      if (this.promises[vin][pSeat]) {
        this.promises[vin][pSeat].reject();
        delete this.promises[vin][pSeat];
      }
    }, 5000);
  }

  enteredVeh(pNetId: number, pSeat: number) {
    const vin = getVinForNetId(pNetId);
    if (!vin) return;
    if (!this.promises[vin]) return;
    if (!this.promises[vin][pSeat]) return;
    this.promises[vin][pSeat].resolve(true);
    delete this.promises[vin][pSeat];
  }
}

const seatingService = SeatingService.getInstance();
export default seatingService;
