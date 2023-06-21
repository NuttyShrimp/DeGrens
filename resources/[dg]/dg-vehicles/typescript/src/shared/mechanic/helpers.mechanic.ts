import { REPAIR_PARTS } from '../status/constants.status';
import { TUNE_PARTS } from '../upgrades/constants.upgrades';

export const buildPartLabel = (item: Mechanic.PartItem) => {
  const prefix = item.type === 'tune' ? `Stage ${item.stage} ` : '';
  const partLabel = item.type === 'repair' ? REPAIR_PARTS[item.part]?.label : TUNE_PARTS[item.part]?.label;
  const suffix = item.type === 'repair' ? ' Onderdeel' : '';
  return `${prefix}${partLabel}${suffix} (${item.class})`;
};

export const buildMechanicStashId = (businessName: string) => `mechanic-shop-stash-${businessName}`;
