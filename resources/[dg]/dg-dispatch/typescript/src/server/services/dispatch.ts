import { Events, Jobs, RPC, Util } from '@dgx/server';

import { addCall } from './store';

export const prepareCall = (id: string, call: Dispatch.Call): Dispatch.UICall => {
  const UICall: Dispatch.UICall = {
    id,
    timestamp: Date.now(),
    ...call,
  };
  if (call.officer) {
    UICall.callsign = String(call.officer);
  }
  return UICall;
};

export const createDispatchCall = async (call: Dispatch.Call) => {
  call.timestamp = Date.now();

  if (call.coords) {
    // shift the coords randomly between 0 and 20 coords
    call.coords.x += Util.getRndInteger(-20, 20);
    call.coords.y += Util.getRndInteger(-20, 20);
    const streetName = await RPC.execute('dispatch:getLocationName', Number(GetPlayerFromIndex(0)), call.coords);
    if (!call.entries) call.entries = {};
    if (streetName) {
      call.entries['earth-europe'] = streetName;
    }
  }

  if (call.criminal && !call.vehicle) {
    const plyPed = GetPlayerPed(String(call.criminal));
    if (plyPed) {
      const plyVeh = GetVehiclePedIsIn(plyPed, false);
      if (plyVeh) {
        call.vehicle = plyVeh;
      }
    }
  }

  if (call.officer) {
    const DGPlayer = await DGCore.Functions.GetOfflinePlayerByCitizenId(call.officer);
    if (DGPlayer.PlayerData.metadata.callsign) {
      call.officer = DGPlayer.PlayerData.metadata.callsign;
    }
  }

  if (call.vehicle && DoesEntityExist(call.vehicle)) {
    let vehEntryText = '';
    const vehNetid = NetworkGetNetworkIdFromEntity(call.vehicle);
    const vehColors = await RPC.execute<Record<'primary' | 'secondary', string>>(
      'dispatch:getVehicleInfo',
      NetworkGetEntityOwner(call.vehicle),
      vehNetid
    );
    const vehConfig = global.exports['dg-vehicles'].getConfigByEntity(call.vehicle);
    if (vehColors) {
      if (vehColors.primary) {
        vehEntryText += vehColors.primary;
      }
      if (vehColors.secondary) {
        vehEntryText += ` en ${vehColors.secondary}`;
      }
    }
    if (vehConfig) {
      vehEntryText += ` ${vehConfig.brand} ${vehConfig.name}`;
    }
    if (!call.entries) call.entries = {};
    call.entries['car'] = vehEntryText;
  }

  const storedCall = addCall(call);

  const policeIds = Jobs.getPlayersForJob('police');
  policeIds.forEach(id => {
    Events.emitNet('dg-dispatch:addCall', id, prepareCall(storedCall.id, storedCall));
  });
};
