import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';
import { create } from '@src/lib/store';

export const useRealEstateStore = create<Phone.RealEstate.State>('phone.app.realestate')(set => ({
  properties: [],
  setProperties: list => set(() => ({ properties: list })),
  fetchProperties: async () => {
    const list = await nuiAction('phone/realestate/get', undefined, devData.realEstateProperties);
    set({ properties: list ?? [] });
  },
  toggleLock: (name, isLocked) =>
    set(s => {
      const newProperties = [...s.properties];
      const property = newProperties.find(p => p.name === name);
      if (!property) return {};
      property.locked = isLocked;
      return {
        properties: newProperties,
      };
    }),
  removeCidAccess: (name, cid) =>
    set(s => {
      const newProperties = [...s.properties];
      const property = newProperties.find(p => p.name === name);
      if (!property || !property.owned) return {};
      property.accessList = property.accessList.filter(a => a.cid !== cid);
      return {
        properties: newProperties,
      };
    }),
}));
