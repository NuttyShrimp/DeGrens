declare namespace Reports {
  type Tab = 'list' | 'new';

  interface TitleInfo {
    back: boolean;
    add: boolean;
    close: boolean;
    title: string;
  }

  interface State {
    tab: Tab;
    reports: Panel.Report[];
    selectedReport: number;
    reportMessages: Panel.Message[];
    connected: boolean;
    titleInfo: TitleInfo;
    unread: number[];
  }

  interface StateActions {
    setTab: (tab: Tab) => void;
    setReports: (reports: Panel.Report[]) => void;
    selectReport: (id: number) => void;
    setReportMessages: (messages: Panel.Message[]) => void;
    setConnected: (toggle: boolean) => void;
    setTitleInfo: (info: TitleInfo) => void;
    addUnread: (id: number) => void;
    markRead: (id: number) => void;
  }
}

declare namespace ReportIndicator {
  interface State {
    counter: number;
    incCounter: () => void;
    resetCounter: () => void;
  }
}
