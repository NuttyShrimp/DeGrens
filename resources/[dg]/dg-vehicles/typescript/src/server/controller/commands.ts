import { Chat, Events, Hospital, Notifications, Police } from '@dgx/server';

// Option got moved to radialmenu
// Chat.registerCommand('motor', 'Zet je motor aan/uit', [], 'user', async src => {
//   const plyPed = GetPlayerPed(String(src));
//   const plyVeh = GetVehiclePedIsIn(plyPed, false);
//   if (!plyVeh || GetPedInVehicleSeat(plyVeh, -1) !== plyPed) {
//     Notifications.add(src, 'Je moet de bestuurder van een voertuig zijn', 'error');
//     return;
//   }
//   const plyVehNetId = NetworkGetNetworkIdFromEntity(plyVeh);
//   const vehClass = await RPC.execute('vehicle:getClass', NetworkGetEntityOwner(plyVeh), plyVehNetId);
//   if (vehClass === -1 || vehClass === 13) {
//     Notifications.add(src, 'Je moet de bestuurder van een voertuig zijn', 'error');
//     return;
//   }
//   const vin = getVinForNetId(plyVehNetId);
//   if (!vin || !keyManager.hasKey(vin, src)) return;
//   setEngineState(plyVeh, !GetIsVehicleEngineRunning(plyVeh))
// });

Chat.registerCommand(
  'seat',
  'Swap to seat',
  [{ name: 'Seat Nr', description: '1 - ...', required: true }],
  'user',
  async (src, _, args) => {
    const seatIndex = Number(args[0]) - 2;
    if (isNaN(seatIndex) || seatIndex < -1) {
      Notifications.add(src, 'Incorrect formaat van stoel nr', 'error');
      return;
    }

    if (Hospital.isDown(src) || Police.isCuffed(src)) {
      Notifications.add(src, 'Je kan dit momenteel niet', 'error');
      return;
    }

    Events.emitNet('vehicles:seat:set', src, seatIndex);
  }
);
