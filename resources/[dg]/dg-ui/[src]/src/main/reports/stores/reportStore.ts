import { devData } from '@src/lib/devdata';
import { isDevel } from '@src/lib/env';
import { nuiAction } from '@src/lib/nui-comms';
import { create } from '@src/lib/store';

export const useReportStore = create<Reports.State & Reports.StateActions>('reports')(set => ({
  tab: 'list',
  reports: isDevel() ? devData.reports : [],
  selectedReport: 0,
  reportMessages: [],
  connected: false,
  titleInfo: {
    title: 'Reports',
    add: true,
    back: false,
    close: false,
  },
  unread: [],
  setTab: t => set(() => ({ tab: t })),
  setReports: r =>
    set(() => ({
      reports: r,
    })),
  selectReport: id => {
    if (id > 0) {
      nuiAction('reports/join', { id });
    }
    set(() =>
      isDevel()
        ? { selectedReport: id, connected: true, reportMessages: devData.reportMessages }
        : { selectedReport: id, tab: 'list' }
    );
  },
  setReportMessages: msgs => set(() => ({ reportMessages: msgs })),
  setConnected: toggle => set(() => ({ connected: toggle })),
  setTitleInfo: info => set(() => ({ titleInfo: info })),
  addUnread: id => set(s => ({ unread: s.unread.includes(id) ? s.unread : [...s.unread, id] })),
  markRead: id => set(s => ({ unread: s.unread.filter(uid => uid !== id) })),
}));