import { RPC, Vehicles } from '@dgx/client';

const sirenToggles: Record<number, { extraId?: number; on?: (veh: number) => void; off?: (veh: number) => void }> =
  Object.entries({
    a6: {
      extraId: 1,
    },
    '22m5': {
      extraId: 1,
    },
    drafter: {
      extraId: 1,
    },
  }).reduce((acc, [key, value]) => ({ ...acc, [GetHashKey(key)]: value }), {});

const canToggleSiren = (veh: number): boolean => {
  if (!veh || !DoesEntityExist(veh)) return false;
  const ped = PlayerPedId();
  if (GetPedInVehicleSeat(veh, -1) !== ped) return false;
  const model = GetEntityModel(veh);
  return !!sirenToggles[model];
};

on('police:toggleSiren', async () => {
  const veh = GetVehiclePedIsIn(PlayerPedId(), false);
  if (!canToggleSiren(veh)) return;
  const isToggled = Entity(veh).state.sirenToggled;
  if (isToggled == undefined) {
    await RPC.execute('lib:state:ensureReplicated', NetworkGetNetworkIdFromEntity(veh), 'sirenToggled', false);
  }
  const modelHash = GetEntityModel(veh);
  const modelData = sirenToggles[modelHash];
  if (!modelData) return;

  Entity(veh).state.set('sirenToggled', !isToggled, true);

  // If the modeldata has an extraId, use that instead of the on/off functions
  if (modelData.extraId !== undefined) {
    const currentUpgrades = Vehicles.getCosmeticUpgrades(veh);
    const extras = currentUpgrades?.extras || [];
    const extraIdx = extras.findIndex(e => e.id == modelData.extraId);
    if (extraIdx === -1) {
      extras.push({ id: modelData.extraId, enabled: !isToggled });
    } else {
      extras[extraIdx].enabled = !isToggled;
    }
    Vehicles.applyUpgrades(veh, { extras });
  }

  // can be used if vehicle siren isnt an extra or more actions need to be done
  if (isToggled) {
    modelData.off?.(veh);
  } else {
    modelData.on?.(veh);
  }
});

global.exports('canToggleSiren', canToggleSiren);
