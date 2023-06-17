import { COSMETIC_KEYS_TO_ID } from '@shared/upgrades/constants.upgrades';
import { ModNameTitle, WHEEL_TYPE_LABELS } from './constant.bennys';

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
  modKey: Vehicles.Upgrades.Cosmetic.ExtendedKey,
  amount: number
): string[] => {
  const labels: string[] = ['Standard'];
  const modId = COSMETIC_KEYS_TO_ID[modKey];
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
  const categories: Bennys.UI.WheelsCategories = [];
  for (let idx = 0; idx < WHEEL_TYPE_LABELS.length; idx++) {
    if (!amountPerCategory[idx] || amountPerCategory[idx] === 0) continue;
    categories.push({
      id: idx,
      label: WHEEL_TYPE_LABELS[idx],
      componentNames: [...new Array(amountPerCategory[idx])].map((_, i) => `${WHEEL_TYPE_LABELS[idx]} #${i + 1}`),
    });
  }
  return categories;
};

export const isEMSVehicle = (vehicle: number) => {
  return GetVehicleClass(vehicle) === 18;
};
