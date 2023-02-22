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
  }

  interface StateActions {
    setTab: (tab: Tab) => void;
    setReports: (reports: Panel.Report[]) => void;
    selectReport: (id: number) => void;
    setReportMessages: (messages: Panel.Message[]) => void;
    setConnected: (toggle: boolean) => void;
    setTitleInfo: (info: TitleInfo) => void;
  }
}