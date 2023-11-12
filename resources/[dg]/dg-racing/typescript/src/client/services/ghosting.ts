import { Notifications, Util } from '@dgx/client';
import { Thread } from '@dgx/shared';

let plyInfoThread = new Thread(
  function () {
    // ServerId to vehicle
    let inScope: Record<number, number> = {};
    for (let srvId of Object.values(this.data.participants) as number[]) {
      let plyId = GetPlayerFromServerId(srvId);
      if (plyId !== PlayerId()) {
        inScope[srvId] = GetVehiclePedIsIn(GetPlayerPed(plyId), false);
      }
    }
    this.data.inScope = inScope;
  },
  1000,
  'tick'
);

let cancelThread = new Thread(
  function () {
    const plyCoords = Util.getPlyCoords();
    let wasPrevented = this.data.prevent;
    this.data.prevent = false;
    for (let ply of GetActivePlayers()) {
      let srvId = GetPlayerServerId(ply);
      if (!srvId || Object.values(plyInfoThread.data.participants).includes(srvId)) continue;
      const ped = GetPlayerPed(ply);
      const veh = GetVehiclePedIsIn(ped, false);
      const vehCoords = Util.getEntityCoords(veh);
      if (vehCoords.distance(plyCoords) > 15) {
        this.data.prevent = true;
        Notifications.add('Ghosting temporarily disabled', 'info', 1000, true, 'ghosting-state');
      }
    }
    if (!this.data.prevent && wasPrevented) {
      Notifications.remove('ghosting-state');
    }
  },
  250,
  'tick'
);

let ghostThread = new Thread(
  () => {
    const ped = PlayerPedId();
    if (!IsPedInAnyVehicle(ped, false)) return;
    const myCoords = Util.getEntityCoords(GetVehiclePedIsIn(ped, false));
    let beGhost = false;
    for (let veh of Object.values(plyInfoThread.data.inScope) as number[]) {
      const vehCoords = Util.getEntityCoords(veh);
      if (myCoords.distance(vehCoords) < 15) {
        beGhost = true;
      }
    }
    if (cancelThread.data.prevent) beGhost = false;
    SetLocalPlayerAsGhost(beGhost);
  },
  0,
  'tick'
);
ghostThread.addHook('afterStart', () => {
  SetLocalPlayerAsGhost(false);
  SetGhostedEntityAlpha(254);
});
ghostThread.addHook('afterStop', () => {
  SetLocalPlayerAsGhost(false);
  SetGhostedEntityAlpha(255);
});

export const initGhostProcess = (race: Racing.ClientRaceState) => {
  plyInfoThread.data.participants = race.participants;
  plyInfoThread.start();
  cancelThread.start();
  ghostThread.start();
};

export const stopGhostProcess = () => {
  ghostThread.stop();
  cancelThread.stop();
  plyInfoThread.stop();
  Notifications.remove('ghosting-state');
};
