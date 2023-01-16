import { create } from '@src/lib/store';

export const useLaptopStore = create<Laptop.State & Laptop.StateActions>('laptop')(set => ({
  activeApps: [],
  notifications: [],
  focusedApp: '',
  windowPositions: {},
  addActiveApp: app =>
    set(s => (s.activeApps.includes(app) ? {} : { activeApps: [...s.activeApps, app], focusedApp: app })),
  removeActiveApp: app => set(s => ({ activeApps: s.activeApps.filter(a => a !== app) })),
  addNotification: noti => set(s => ({ notifications: [...s.notifications, noti] })),
  removeNotification: notiId => set(s => ({ notifications: s.notifications.filter(n => n.id !== notiId) })),
  setFocusedApp: app => set(() => ({ focusedApp: app })),
  setWindowPosition: (app, pos) => set(s => ({ windowPositions: { ...s.windowPositions, [app]: pos } })),
}));
