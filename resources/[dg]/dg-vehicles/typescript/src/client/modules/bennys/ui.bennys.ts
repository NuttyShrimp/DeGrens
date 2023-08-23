import { Events, RPC, Sounds, UI } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';
import { PlateColorLabels, TyreSmokeLabels, UPGRADEABLE_CATEGORIES } from './constant.bennys';
import {
  closeUI,
  getBlockedUpgrades,
  getCurrentBennys,
  getEquippedUpgradesOnEnter,
  handleVehicleRepair,
  tryToApplyBennysModelStance,
} from './service.bennys';
import { getLabelsForModId, getLiveryLabels, getWheelTypeComponents, isEMSVehicle } from './util.bennys';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';

const createGenericEntry = <T extends Vehicles.Upgrades.Cosmetic.Key>(
  veh: number,
  key: T,
  entry: Vehicles.Upgrades.Cosmetic.Upgrades[T],
  amount?: number | Record<number, number>
): Bennys.UI.Components.Generic | Bennys.UI.Components.Color | null => {
  if (UPGRADEABLE_CATEGORIES.colors.includes(key)) {
    // we can cast types because the check above validates
    return { name: key as Bennys.ColorKey, equipped: entry as number | RGB } satisfies Bennys.UI.Components.Color;
  }

  switch (key) {
    case 'livery': {
      return {
        name: key,
        equipped: entry as Vehicles.Upgrades.Cosmetic.Upgrades['livery'],
        componentNames:
          GetVehicleLiveryCount(veh) === -1 ? getLabelsForModId(veh, key, amount as number) : getLiveryLabels(veh),
      };
    }
    case 'plateColor': {
      return {
        name: key,
        equipped: entry as Vehicles.Upgrades.Cosmetic.Upgrades['plateColor'],
        componentNames: PlateColorLabels,
      };
    }
    case 'tyreSmokeColor': {
      return {
        name: key,
        equipped: entry as Vehicles.Upgrades.Cosmetic.Upgrades['tyreSmokeColor'],
        componentNames: TyreSmokeLabels,
      };
    }
    default:
      switch (typeof entry) {
        case 'number': {
          if (!amount) return null;
          return {
            name: key,
            equipped: entry,
            componentNames: getLabelsForModId(veh, key as Vehicles.Upgrades.Cosmetic.ExtendedKey, amount as number),
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
  if (!plyVeh) return cb({ data: Object.keys(UPGRADEABLE_CATEGORIES), meta: { ok: true, message: '' } });

  const possibilities = upgradesManager.getAmounts(plyVeh);
  if (!possibilities) return cb({ data: {}, meta: { ok: false, message: 'Could not upgrade possibilities' } });

  // wheels is always available, exterior also bcus of plate, tyresmoke and claxons
  const activeMenus: Bennys.Category[] = ['exterior', 'wheels'];
  // Colors not enabled for ems vehicles
  if (!isEMSVehicle(plyVeh)) {
    activeMenus.push('colors');
  }

  (Object.entries(UPGRADEABLE_CATEGORIES) as ObjEntries<typeof UPGRADEABLE_CATEGORIES>).forEach(
    ([type, categories]) => {
      if (activeMenus.includes(type)) return;
      if (
        !categories.some(key => {
          let amount = possibilities[key as keyof typeof possibilities] ?? 0;
          if (typeof amount !== 'number') amount = 1;
          amount -= getBlockedUpgrades()?.[key]?.length ?? 0;
          return amount > 0;
        })
      )
        return;
      activeMenus.push(type);
    }
  );
  cb({ data: activeMenus, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:getGenericData', (data: { type: 'interior' | 'exterior' | 'colors' }, cb) => {
  const upgrades = getEquippedUpgradesOnEnter();
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });

  const possibilities = upgradesManager.getAmounts(plyVeh);
  if (!possibilities) return cb({ data: {}, meta: { ok: false, message: 'Could not upgrade possibilities' } });
  const entries: (Bennys.UI.Components.Generic | Bennys.UI.Components.Color)[] = [];

  (Object.keys(upgrades) as Vehicles.Upgrades.Cosmetic.Key[])
    // neon/xenon for example cant be upgraded so filter them out
    .forEach(key => {
      if (!UPGRADEABLE_CATEGORIES[data.type].includes(key)) return;
      // this shit gets filtered because of the upgradeable const so fuck ts
      const entry = createGenericEntry(
        plyVeh,
        key,
        upgrades[key],
        ((possibilities as unknown as any)[key] ?? 0) as number
      );
      const blockedIds = getBlockedUpgrades()?.[key] ?? [];
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
  const info = getEquippedUpgradesOnEnter().wheels;
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });

  const wheelPossibilities = upgradesManager.getAmountByKey(plyVeh, ['wheels'])?.wheels;
  if (!wheelPossibilities) return cb({ data: {}, meta: { ok: false, message: 'Could not upgrade possibilities' } });

  const blockedIds = getBlockedUpgrades()?.wheels ?? [];
  const data = {
    equipped: {
      type: info.type,
      id: info.id,
    },
    categories: getWheelTypeComponents(wheelPossibilities).filter((_, i) => !blockedIds.includes(i)),
  };
  cb({ data, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:getExtraData', (_, cb) => {
  const blockedIds = getBlockedUpgrades()?.extras ?? [];
  const info = getEquippedUpgradesOnEnter().extras.filter(e => !blockedIds.includes(e.id));
  cb({ data: info, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('bennys:preview', (data: Bennys.UI.Change, cb) => {
  const plyVeh = getCurrentVehicle();
  if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });
  if (!data) return cb({ data: {}, meta: { ok: true, message: 'No data' } });

  upgradesManager.setByKey(plyVeh, data.name, data.data);

  tryToApplyBennysModelStance(plyVeh, data.name, data.data);

  cb({ data: {}, meta: { ok: true, message: '' } });
});

// Used on previewing equipped when removing item from cart
UI.RegisterUICallback(
  'bennys:previewEquipped',
  (
    data: { component: 'extras'; data: number } | { component: Exclude<Vehicles.Upgrades.Cosmetic.Key, 'extras'> },
    cb
  ) => {
    const plyVeh = getCurrentVehicle();
    if (!plyVeh) return cb({ data: {}, meta: { ok: false, message: 'Could not get your current vehicle' } });
    if (!data) return cb({ data: {}, meta: { ok: true, message: 'No data' } });

    const equippedData = getEquippedUpgradesOnEnter();
    if (data.component === 'extras') {
      const extra = equippedData.extras.find(e => e.id === data.data)?.enabled ?? false;
      upgradesManager.setByKey(plyVeh, 'extras', [
        {
          id: data.data,
          enabled: extra,
        },
      ]);
    } else {
      upgradesManager.setByKey(plyVeh, data.component, equippedData[data.component]);
    }

    tryToApplyBennysModelStance(plyVeh, data.component, equippedData[data.component]);

    cb({ data: {}, meta: { ok: true, message: '' } });
  }
);

UI.RegisterUICallback('bennys:exit', (_, cb) => {
  Events.emitNet('vehicles:bennys:resetVehicle', getCurrentBennys());
  closeUI();
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback(
  'bennys:buyUpgrades',
  (cart: { upgrades: { component: Vehicles.Upgrades.Cosmetic.Key; data: any }[] }, cb) => {
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
  const prices = await RPC.execute<Vehicles.Upgrades.Prices.Prices>('vehicles:bennys:getPrices', getCurrentBennys());
  cb({ data: prices, meta: { ok: true, message: '' } });
});
