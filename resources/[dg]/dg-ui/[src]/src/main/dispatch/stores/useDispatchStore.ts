import { devData } from '@src/lib/devdata';
import { isDevel } from '@src/lib/env';
import { create } from '@src/lib/store';

export const useDispatchStore = create<Dispatch.State & Dispatch.StateActions>('dispatch')(set => ({
  calls: isDevel() ? devData.dispatchCalls : [],
  storeSize: 20,
  cams: isDevel() ? devData.dispatchCams : [],
  addCall: c => set(s => ({ calls: [c, ...s.calls].slice(0, s.storeSize) })),
  addCalls: calls =>
    set(s => ({
      calls: [...calls, ...s.calls].slice(0, s.storeSize + calls.length),
      storeSize: s.storeSize + calls.length,
    })),
  setCalls: calls => set(() => ({ storeSize: Math.max(20, calls.length), calls })),
  setCams: cams =>
    set(() => ({
      cams,
    })),
}));
