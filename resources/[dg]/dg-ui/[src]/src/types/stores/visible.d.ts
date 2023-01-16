declare namespace VisStore {
  interface State {
    visibleApps: (keyof RootState)[];
    toggleApp: (app: keyof RootState, toggle: boolean) => void;
  }
}
