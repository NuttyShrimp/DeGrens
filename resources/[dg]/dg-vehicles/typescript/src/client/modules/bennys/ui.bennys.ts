import { Events, RPC, Sounds, UI } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';
import { applyModelStance } from 'modules/stances/service.stances';
import { applyUpgrade, getCosmeticUpgradePossibilities } from 'modules/upgrades/service.upgrades';

import { PlateColorLabels, TyreSmokeLabels, upgradeableCategories } from './constant.bennys';
import {
  closeUI,
  getBlockedUpgrades,
  getCurrentBennys,
  getEquippedUpgradesOnEnter,
  getModelStanceData,
  getOriginalStance,
  handleVehicleRepair,
} from './service.bennys';
import { getLabelsForModId, getLiveryLabels, getWheelTypeComponents, isEMSVehicle } from './util.bennys';

const createGenericEntry = <T extends keyof Vehicles.Upgrades.Cosmetic>(
  veh: number,
  key: T,
  entry: Vehicles.Upgrades.Cosmetic[T],
  amount?: number | Record<number, number>
): Bennys.UI.Components.Generic | Bennys.UI.Components.Color | null => {
  if (upgradeableCategories.colors.includes(key)) {
    const equipped = entry as number | RGB;
    return { name: key, equipped };
  }

  switch (key) {
    case 'livery': {
      const info = entry as Vehicles.Upgrades.Cosmetic['livery'];
      return {
        name: key,
        equipped: info,
        componentNames:
          GetVehicleLiveryCount(veh) === -1 ? getLabelsForModId(veh, key, amount as number) : getLiveryLabels(veh),
      };
    }
    case 'plateColor': {
      const info = entry as Vehicles.Upgrades.Cosmetic['plateColor'];
      return {
        name: key,
        equipped: info,
        componentNames: PlateColorLabels,
      };
    }
    case 'tyreSmokeColor': {
      const info = entry as Vehicles.Upgrades.Cosmetic['tyreSmokeColor'];
      return {
        name: key,
        equipped: info,
        componentNames: TyreSmokeLabels,
      };
    }
    default:
      switch (typeof entry) {
        case 'number': {
          if (!amount) return null;
          const modKey = key as keyof Vehicles.Upgrades.CosmeticModIds;
          return {
            name: modKey,
            equipped: entry,
            componentNames: getLabelsForModId(veh, modKey, amount as number),
          };
        }
        default: {
          console.error(`${key} ${typeof entry} has no menu generation thing`);
          return null;
        }
      }
  }
};

UI.RegisterUICallback('bennys:getActiveMenus', (_, cb) => {
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: Object.keys(upgradeableCategories), meta: { ok: true, message: '' } });

  const possibilities = getCosmeticUpgradePossibilities(plyVeh);
  if (!possibilities) return cb({ data: {}, meta: { ok: false, message: 'Could not upgrade possibilities' } });

  // wheels is always available, exterior also bcus of plate, tyresmoke and claxons
  const activeMenus: (keyof typeof upgradeableCategories)[] = ['exterior', 'wheels'];
  // Colors not enabled for ems vehicles
  if (!isEMSVehicle(plyVeh)) {
    activeMenus.push('colors');
  }

  Object.entries(upgradeableCategories).forEach(([type, categories]) => {
    if (activeMenus.includes(type as keyof typeof upgradeableCategories)) return;
    if (
      !categories.some(key => {
        let amount = possibilities[key as keyof typeof possibilities] ?? 0;
        if (typeof amount === 'object') amount = 1;
        const min = key === 'extras' ? 0 : 1;
        amount -= getBlockedUpgrades()?.[key as keyof Vehicles.Upgrades.Cosmetic]?.length ?? 0;
        return amount > min;
      })
    )
      return;
    activeMenus.push(type as keyof typeof upgradeableCategories);
  });
  cb({ data: activeMenus, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:getGenericData', (data: { type: 'interior' | 'exterior' | 'colors' }, cb) => {
  const upgrades = getEquippedUpgradesOnEnter();
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });

  const possibilities = getCosmeticUpgradePossibilities(plyVeh);
  if (!possibilities) return cb({ data: {}, meta: { ok: false, message: 'Could not upgrade possibilities' } });
  const entries: (Bennys.UI.Components.Generic | Bennys.UI.Components.Color)[] = [];
  (
    Object.keys(upgrades).filter(key =>
      upgradeableCategories[data.type].includes(key)
    ) as (keyof Vehicles.Upgrades.Cosmetic)[]
  ) // neon/xenon for example cant be upgraded so filter them out
    .forEach(key => {
      const entry = createGenericEntry(
        plyVeh,
        key,
        upgrades[key],
        possibilities[key as keyof Vehicles.Upgrades.MaxedCosmetic]
      );
      const blockedIds = getBlockedUpgrades()?.[key as keyof Vehicles.Upgrades.Cosmetic] ?? [];
      if (!entry) return;
      if ('componentNames' in entry) {
        // Filter names based on blocked ids
        entry.componentNames = entry.componentNames.filter((_, i) => !blockedIds.includes(i));
      }
      if ('componentNames' in entry && entry.componentNames.length < 2) return;
      entries.push(entry);
    });

  if (!entries) {
    return cb({ data: [], meta: { ok: false, message: 'Could not get your current vehicle components info' } });
  }
  cb({ data: entries, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:getWheelData', (_, cb) => {
  const key = 'wheels' as keyof Vehicles.Upgrades.Cosmetic;
  const info = getEquippedUpgradesOnEnter()[key] as Vehicles.Upgrades.Cosmetic['wheels'];
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });

  const possibilities = getCosmeticUpgradePossibilities(plyVeh);
  if (!possibilities) return cb({ data: {}, meta: { ok: false, message: 'Could not upgrade possibilities' } });
  const wheelPossibilities = possibilities[key as keyof Vehicles.Upgrades.MaxedCosmetic];
  const blockedIds = getBlockedUpgrades()?.[key] ?? [];
  const data = {
    equipped: {
      type: info.type,
      id: info.id,
    },
    categories: getWheelTypeComponents(wheelPossibilities as Vehicles.Upgrades.MaxedCosmetic['wheels']).filter(
      (_, i) => !blockedIds.includes(i)
    ),
  };
  cb({ data, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:getExtraData', (_, cb) => {
  const key = 'extras' as keyof Vehicles.Upgrades.Cosmetic;
  const blockedIds = getBlockedUpgrades()?.[key] ?? [];
  const info = (getEquippedUpgradesOnEnter()[key] as Vehicles.Upgrades.Cosmetic['extras']).filter(e =>
    blockedIds.includes(e.id)
  );
  cb({ data: info, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:preview', (data: Bennys.UI.Change, cb) => {
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });
  if (!data) return cb({ data: {}, meta: { ok: true, message: 'No data' } });

  if (data.name === 'extras') {
    applyUpgrade(plyVeh, 'extras', [data.data]);
  } else {
    applyUpgrade(plyVeh, data.name as keyof Vehicles.Upgrades.AllCosmeticModIds, data.data as any);
  }

  // Try to apply stance related to upgrades
  applyModelStance(plyVeh, data.name, data.data as number, getModelStanceData(), getOriginalStance());

  cb({ data: {}, meta: { ok: true, message: '' } });
});

// Used on previewing equipped when removing item from cart
UI.RegisterUICallback('bennys:previewEquipped', (data: { component: string; data?: any }, cb) => {
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });
  if (!data) return cb({ data: {}, meta: { ok: true, message: 'No data' } });

  const equippedData = getEquippedUpgradesOnEnter()[data.component as keyof Vehicles.Upgrades.Cosmetic];
  if (data.component === 'extras') {
    const extra = (equippedData as Vehicles.Upgrades.Cosmetic['extras']).find(e => e.id === data.data)?.enabled;
    applyUpgrade(plyVeh, 'extras', [
      {
        id: data.data,
        enabled: extra,
      },
    ]);
  } else {
    applyUpgrade(plyVeh, data.component as keyof Vehicles.Upgrades.Cosmetic, equippedData);
  }

  // Try to apply stance related to upgrades
  applyModelStance(plyVeh, data.component, equippedData as number, getModelStanceData(), getOriginalStance());

  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:exit', (_, cb) => {
  Events.emitNet('vehicles:bennys:resetVehicle', getCurrentBennys());
  closeUI();
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback(
  'bennys:buyUpgrades',
  (cart: { upgrades: { component: keyof Vehicles.Upgrades.Cosmetic; data: any }[] }, cb) => {
    Events.emitNet('vehicles:bennys:buyUpgrades', getCurrentBennys(), cart.upgrades);
    closeUI();
    cb({ data: {}, meta: { ok: true, message: '' } });
  }
);

UI.RegisterUICallback('bennys:repairVehicle', (_, cb) => {
  handleVehicleRepair();
  closeUI();
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:playSound', (_, cb) => {
  Sounds.playLocalSound('airwrench', 0.08);
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:getPrices', async (_, cb) => {
  const prices = await RPC.execute('vehicles:bennys:getPrices', getCurrentBennys());
  cb({ data: prices, meta: { ok: true, message: '' } });
});
