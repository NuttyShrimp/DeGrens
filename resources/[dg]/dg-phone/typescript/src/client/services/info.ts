import { Core, RPC, UI } from '@dgx/client';

type Entry = {
  name: string;
  icon: string;
  prefix?: string;
  color?: string;
  getter: () => Promise<number | string> | number | string;
};
type UIEntry = Omit<Entry, 'getter'> & { value: ReturnType<Entry['getter']> };

// Map keeps insertion order
const entries: Map<string, Entry> = new Map();

const registerInfoEntry = (data: Entry) => {
  entries.set(data.name, data);
};

export const cleanInfoEntries = () => {
  entries.clear();
};

global.exports('registerInfoEntry', registerInfoEntry);

on('dg-phone:load', () => {
  const charModule = Core.getModule('characters');
  registerInfoEntry({
    name: 'id',
    icon: 'id-card',
    prefix: '#',
    getter: () => {
      return LocalPlayer.state.citizenid;
    },
  });
  registerInfoEntry({
    name: 'phone',
    icon: 'hashtag',
    getter: () => {
      const charInfo = charModule.getCharinfo();
      if (!charInfo) return 'Unknown';
      return charInfo.phone;
    },
  });
  registerInfoEntry({
    name: 'cash',
    icon: 'wallet',
    prefix: '€',
    color: '#81c784',
    getter: () => {
      return global.exports['dg-financials'].getCash();
    },
  });
  registerInfoEntry({
    name: 'bank',
    icon: 'piggy-bank',
    prefix: '€',
    color: '#64b5f6',
    getter: async () => {
      const acc = await RPC.execute('financials:getDefaultAccount');
      return Math.round(acc?.balance ?? 0);
    },
  });
});

UI.RegisterUICallback('phone/info/fetchInfo', async (_, cb) => {
  const uiEntries: UIEntry[] = [];
  for (const [_, entry] of entries) {
    const { getter, ...data } = entry;
    const value = await getter();
    uiEntries.push({
      ...data,
      value,
    });
  }
  cb({ data: uiEntries, meta: { ok: true, message: 'done' } });
});
