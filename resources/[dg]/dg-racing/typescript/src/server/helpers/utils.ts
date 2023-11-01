import { Inventory, Util } from '@dgx/server';

const hasItem = async (src: number, item: string) => {
  const cid = Util.getCID(src);
  return await Inventory.doesInventoryHaveItems('player', String(cid), item);
};

export const hasDongle = async (src: number) => hasItem(src, 'race_dongle');
export const hasCreatorDongle = async (src: number) => hasItem(src, 'race_creator_dongle');
