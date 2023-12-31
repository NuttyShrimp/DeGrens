import { Core, Events, Jobs, RPC, Sounds, Util, Vehicles } from '@dgx/server';

import { addCall } from './store';

const toggledDispatchPlayers = new Set<number>();

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

export const createDispatchCall = async (job: 'ambulance' | 'police', call: Omit<Dispatch.Call, 'job'>) => {
  call.timestamp = Date.now();

  if (call.coords) {
    if (!call.skipCoordsRandomization) {
      // shift the coords randomly between 0 and 20 coords
      call.coords.x += Util.getRndInteger(-20, 20);
      call.coords.y += Util.getRndInteger(-20, 20);
    }
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
    const DGPlayer = Core.getPlayer(call.officer);
    if (DGPlayer?.metadata.callsign) {
      call.officer = DGPlayer.metadata.callsign as unknown as number; // fuckoff typescript
    }
  }

  if (call.vehicle && DoesEntityExist(call.vehicle)) {
    let vehEntryText = '';
    const vehNetid = NetworkGetNetworkIdFromEntity(call.vehicle);
    const vehColors = await Util.sendRPCtoEntityOwner<Record<'primary' | 'secondary', string>>(
      call.vehicle,
      'dispatch:getVehicleInfo',
      vehNetid
    );
    if (vehColors) {
      if (vehColors.primary) {
        vehEntryText += vehColors.primary;
      }
      if (vehColors.secondary) {
        vehEntryText += ` en ${vehColors.secondary}`;
      }
    }
    const vehConfig = Vehicles.getConfigByEntity(call.vehicle);
    if (vehConfig) {
      vehEntryText += ` ${vehConfig.brand} ${vehConfig.name} (${vehConfig.class})`;
    }
    if (!call.entries) call.entries = {};
    call.entries['car'] = vehEntryText;
  }

  const storedCall = addCall({ ...call, job });

  const playerIds = Jobs.getPlayersForJob(job);
  playerIds.forEach(id => {
    Events.emitNet('dg-dispatch:addCall', id, prepareCall(storedCall.id, storedCall));

    // TODO: Make louder, cant be heared by other players because so quiet
    if (call.syncedSoundAlert) {
      const soundId = `dispatch-imp-${storedCall.id}-${id}`;
      Sounds.playOnEntity(
        soundId,
        'emergency',
        'DLC_NUTTY_SOUNDS',
        NetworkGetNetworkIdFromEntity(GetPlayerPed(String(id)))
      );
      setTimeout(() => {
        Sounds.stop(soundId);
      }, 4000);
    }
  });
};

export const setPlayerToggledDispatch = (plyId: number, toggle: boolean) => {
  if (toggle) {
    toggledDispatchPlayers.add(plyId);
  } else {
    toggledDispatchPlayers.delete(plyId);
  }
};

export const hasPlayerToggledDispatch = (plyId: number) => {
  return toggledDispatchPlayers.has(plyId);
};
