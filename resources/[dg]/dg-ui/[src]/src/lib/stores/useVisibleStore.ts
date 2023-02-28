import { isDevel } from '../env';
import { create } from '../store';

const defaultVisApps: (keyof RootState)[] = ['interaction', 'notifications', 'itemboxes', 'reports-indicator'];

export const useVisibleStore = create<VisStore.State>('visible')(set => ({
  visibleApps: isDevel() ? ['cli', 'debuglogs', ...defaultVisApps] : defaultVisApps,
  toggleApp: (app, toggle) =>
    set(s => {
      if (toggle && !s.visibleApps.includes(app)) {
        return {
          visibleApps: [...s.visibleApps, app],
        };
      }
      const appIdx = s.visibleApps.findIndex(a => a === app);
      if (!toggle && appIdx !== -1) {
        const apps = [...s.visibleApps];
        apps.splice(appIdx, 1);
        return {
          visibleApps: apps,
        };
      }
      return s;
    }),
}));