import { Util } from '@dgx/server';

class SeatingService extends Util.Singleton<SeatingService>() {
  private enteringPlayers: Record<number, NodeJS.Timeout> = {};

  public trySeating(plyId: number, netId: number, seat: number) {
    const veh = NetworkGetEntityFromNetworkId(netId);
    if (!veh || !DoesEntityExist(veh)) return;

    this.enteringPlayers[plyId] = setTimeout(() => {
      const ped = GetPlayerPed(String(plyId));
      SetPedIntoVehicle(ped, veh, seat);
      delete this.enteringPlayers[plyId];
    }, 5000);
  }

  public cancelSeating(plyId: number) {
    const timeout = this.enteringPlayers[plyId];
    if (!timeout) return;

    clearTimeout(timeout);
    delete this.enteringPlayers[plyId];
  }
}

const seatingService = SeatingService.getInstance();
export default seatingService;
