import { RPC, Vehicles } from '@dgx/client';

const sirenToggles: Record<string, { on: (veh: number) => void; off: (veh: number) => void }> = {
  a6: {
    on: veh => {
      const currentUpgrades = Vehicles.getCosmeticUpgrades(veh);
      const extras: Vehicles.Upgrades.Cosmetic['extras'] = currentUpgrades?.extras || [];
      const extra = extras.find(e => e.id == 1);
      if (extra) {
        extra.enabled = true;
      } else {
        extras.push({ id: 1, enabled: true });
      }
      Vehicles.applyNewCosmeticUpgrades(veh, { extras });
    },
    off: veh => {
      const currentUpgrades = Vehicles.getCosmeticUpgrades(veh);
      const extras: Vehicles.Upgrades.Cosmetic['extras'] = currentUpgrades?.extras || [];
      const sirenExtraIdx = extras.findIndex(e => e.id === 1);
      extras[sirenExtraIdx].enabled = false;
      Vehicles.applyNewCosmeticUpgrades(veh, { extras });
    },
  },
  '22m5': {
    on: veh => {
      const currentUpgrades = Vehicles.getCosmeticUpgrades(veh);
      const extras: Vehicles.Upgrades.Cosmetic['extras'] = currentUpgrades?.extras || [];
      const extra = extras.find(e => e.id == 1);
      if (extra) {
        extra.enabled = true;
      } else {
        extras.push({ id: 1, enabled: true });
      }
      Vehicles.applyNewCosmeticUpgrades(veh, { extras });
    },
    off: veh => {
      const currentUpgrades = Vehicles.getCosmeticUpgrades(veh);
      const extras: Vehicles.Upgrades.Cosmetic['extras'] = currentUpgrades?.extras || [];
      const sirenExtraIdx = extras.findIndex(e => e.id === 1);
      extras[sirenExtraIdx].enabled = false;
      Vehicles.applyNewCosmeticUpgrades(veh, { extras });
    },
  },
  drafter: {
    on: veh => {
      const currentUpgrades = Vehicles.getCosmeticUpgrades(veh);
      const extras: Vehicles.Upgrades.Cosmetic['extras'] = currentUpgrades?.extras || [];
      const extra = extras.find(e => e.id == 1);
      if (extra) {
        extra.enabled = true;
      } else {
        extras.push({ id: 1, enabled: true });
      }
      Vehicles.applyNewCosmeticUpgrades(veh, { extras });
    },
    off: veh => {
      const currentUpgrades = Vehicles.getCosmeticUpgrades(veh);
      const extras: Vehicles.Upgrades.Cosmetic['extras'] = currentUpgrades?.extras || [];
      const sirenExtraIdx = extras.findIndex(e => e.id === 1);
      extras[sirenExtraIdx].enabled = false;
      Vehicles.applyNewCosmeticUpgrades(veh, { extras });
    },
  },
};
const toggeableVehicles: number[] = [];

setImmediate(() => {
  Object.keys(sirenToggles).forEach(model => {
    const hash = GetHashKey(model);
    if (hash === 0) {
      console.error(`[SIREN] Model ${model} does not exist`);
      return;
    }
    toggeableVehicles.push(hash);
  });
});

const canToggleSiren = (veh: number): boolean => {
  const model = GetEntityModel(veh);
  return toggeableVehicles.includes(model);
};

const getModelForHash = (hash: number): string | null => {
  const keyIdx = toggeableVehicles.indexOf(hash);
  if (keyIdx === -1) return null;
  return Object.keys(sirenToggles)[keyIdx];
};

on('police:toggleSiren', async () => {
  const veh = GetVehiclePedIsIn(PlayerPedId(), false);
  if (!veh) return;
  if (!canToggleSiren(veh)) return;
  const isToggled = Entity(veh).state.sirenToggled;
  if (isToggled === undefined || isToggled === null) {
    await RPC.execute('lib:state:ensureReplicated', NetworkGetNetworkIdFromEntity(veh), 'sirenToggled', false);
  }
  const modelHash = GetEntityModel(veh);
  const model = getModelForHash(modelHash);
  if (!model || !sirenToggles[model]) return;
  if (isToggled) {
    sirenToggles[model].off(veh);
    Entity(veh).state.set('sirenToggled', false, true);
  } else {
    sirenToggles[model].on(veh);
    Entity(veh).state.set('sirenToggled', true, true);
  }
});

global.exports('canToggleSiren', canToggleSiren);
