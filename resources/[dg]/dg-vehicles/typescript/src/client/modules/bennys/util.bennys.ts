import { allCosmeticKeysToId } from 'modules/upgrades/constants.upgrades';

import { ModNameTitle, WheelTypeLabels } from './constant.bennys';

export const getLiveryLabels = (veh: number) => {
  const labels = [];
  for (let i = 0; i < GetVehicleLiveryCount(veh); i++) {
    let label = GetLabelText(GetLiveryName(veh, i));
    if (label === 'NULL') {
      label = `Livery #${i + 1}`;
    }
    labels.push(label);
  }
  return labels;
};

export const getLabelsForModId = (
  veh: number,
  modKey: keyof Vehicles.Upgrades.AllCosmeticModIds,
  amount: number
): string[] => {
  const labels: string[] = ['Standard'];
  const modId = allCosmeticKeysToId[modKey];
  for (let i = 0; i < amount; i++) {
    let label = GetLabelText(GetModTextLabel(veh, modId, i));
    if (label === 'NULL') {
      label = `${ModNameTitle[modKey]} #${i + 1}`;
    }
    labels.push(label);
  }
  return labels;
};

export const getWheelTypeComponents = (amountPerCategory: Record<number, number>) => {
  const categories: Bennys.UI.Components.Wheels['categories'] = [];
  WheelTypeLabels.forEach((label, category) => {
    if (!amountPerCategory[category]) return;
    categories.push({
      id: category,
      label,
      componentNames: getWheelLabels(amountPerCategory[category], label),
    });
  });
  return categories;
};

const getWheelLabels = (amount: number, categoryLabel: string) => {
  const labels: string[] = [];
  for (let i = 0; i < amount; i++) {
    labels.push(`${categoryLabel} #${i + 1}`);
  }
  return labels;
};

export const isEMSVehicle = (vehicle: number) => {
  return GetVehicleClass(vehicle) === 18;
};
