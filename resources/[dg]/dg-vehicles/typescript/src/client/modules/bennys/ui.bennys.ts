import { Events, RPC, Sounds, UI } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';
import { applyModelStance } from 'modules/stances/service.stances';
import { applyUpgrade, getCosmeticUpgradePossibilities } from 'modules/upgrades/service.upgrades';

import { PlateColorLabels, TyreSmokeLabels, upgradeableCategories } from './constant.bennys';
import {
  closeUI,
  getCurrentBennys,
  getEquippedUpgradesOnEnter,
  handleVehicleRepair,
  modelStanceData,
  originalStance,
} from './service.bennys';
import { getLabelsForModId, getLiveryLabels, getWheelTypeComponents } from './util.bennys';

const createGenericEntry = <T extends keyof Upgrades.Cosmetic>(
  veh: number,
  key: T,
  entry: Upgrades.Cosmetic[T],
  amount?: number | Record<number, number>
): Bennys.UI.Components.Generic | Bennys.UI.Components.Color | null => {
  if (upgradeableCategories.colors.includes(key)) {
    const equipped = entry as number | RGB;
    return { name: key, equipped };
  }

  switch (key) {
    case 'livery': {
      const info = entry as Upgrades.Cosmetic['livery'];
      return {
        name: key,
        equipped: info,
        componentNames:
          GetVehicleLiveryCount(veh) === -1 ? getLabelsForModId(veh, key, amount as number) : getLiveryLabels(veh),
      };
    }
    case 'plateColor': {
      const info = entry as Upgrades.Cosmetic['plateColor'];
      return {
        name: key,
        equipped: info,
        componentNames: PlateColorLabels,
      };
    }
    case 'tyreSmokeColor': {
      const info = entry as Upgrades.Cosmetic['tyreSmokeColor'];
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
          const modKey = key as keyof Upgrades.CosmeticModIds;
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
  // Colors and wheels are always available, exterior also bcus of plate, tyresmoke and claxons
  const activeMenus: (keyof typeof upgradeableCategories)[] = ['colors', 'exterior', 'wheels'];
  Object.entries(upgradeableCategories).forEach(([type, categories]) => {
    if (activeMenus.includes(type as keyof typeof upgradeableCategories)) return;
    if (
      !categories.some(key => {
        let amount = possibilities[key as keyof typeof possibilities] ?? 0;
        if (typeof amount === 'object') amount = 1;
        const min = key === 'extras' ? 0 : 1;
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
  (Object.keys(upgrades).filter(key => upgradeableCategories[data.type].includes(key)) as (keyof Upgrades.Cosmetic)[]) // neon/xenon for example cant be upgraded so filter them out
    .forEach(key => {
      const entry = createGenericEntry(plyVeh, key, upgrades[key], possibilities[key as keyof Upgrades.MaxedCosmetic]);
      if (!entry) return;
      if ('componentNames' in entry && entry.componentNames.length < 2) return;
      entries.push(entry);
    });

  if (!entries) {
    return cb({ data: [], meta: { ok: false, message: 'Could not get your current vehicle components info' } });
  }
  cb({ data: entries, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:getWheelData', (_, cb) => {
  const key = 'wheels' as keyof Upgrades.Cosmetic;
  const info = getEquippedUpgradesOnEnter()[key] as Upgrades.Cosmetic['wheels'];
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });

  const possibilities = getCosmeticUpgradePossibilities(plyVeh);
  if (!possibilities) return cb({ data: {}, meta: { ok: false, message: 'Could not upgrade possibilities' } });
  const wheelPossibilities = possibilities[key as keyof Upgrades.MaxedCosmetic];
  const data = {
    equipped: {
      type: info.type,
      id: info.id,
    },
    categories: getWheelTypeComponents(wheelPossibilities as Upgrades.MaxedCosmetic['wheels']),
  };
  cb({ data, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:getExtraData', (_, cb) => {
  const key = 'extras' as keyof Upgrades.Cosmetic;
  const info = getEquippedUpgradesOnEnter()[key] as Upgrades.Cosmetic['extras'];
  cb({ data: info, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:preview', (data: Bennys.UI.Change, cb) => {
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });
  if (!data) return cb({ data: {}, meta: { ok: true, message: 'No data' } });

  if (data.name === 'extras') {
    applyUpgrade(plyVeh, 'extras', [data.data]);
  } else {
    applyUpgrade(plyVeh, data.name as keyof Upgrades.AllCosmeticModIds, data.data as any);
  }

  // Stancing per model
  if (modelStanceData.length !== 0 && upgradeableCategories.exterior.includes(data.name)) {
    applyModelStance(plyVeh, data.name, data.data as number, modelStanceData, originalStance);
  }

  cb({ data: {}, meta: { ok: true, message: '' } });
});

// Used on previewing equipped when removing item from cart
UI.RegisterUICallback('bennys:previewEquipped', (data: { component: string; data?: any }, cb) => {
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });
  if (!data) return cb({ data: {}, meta: { ok: true, message: 'No data' } });

  const equippedData = getEquippedUpgradesOnEnter()[data.component as keyof Upgrades.Cosmetic];
  if (data.component === 'extras') {
    const extra = (equippedData as Upgrades.Cosmetic['extras']).find(e => e.id === data.data)?.enabled;
    applyUpgrade(plyVeh, 'extras', [
      {
        id: data.data,
        enabled: extra,
      },
    ]);
  } else {
    applyUpgrade(plyVeh, data.component as keyof Upgrades.Cosmetic, equippedData);
  }

  // Stancing per model
  if (modelStanceData.length !== 0 && upgradeableCategories.exterior.includes(data.component)) {
    applyModelStance(plyVeh, data.component, equippedData as number, modelStanceData, originalStance);
  }

  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:exit', (_, cb) => {
  Events.emitNet('vehicles:bennys:resetVehicle', getCurrentBennys());
  closeUI();
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback(
  'bennys:buyUpgrades',
  (cart: { upgrades: { component: keyof Upgrades.Cosmetic; data: any }[] }, cb) => {
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
