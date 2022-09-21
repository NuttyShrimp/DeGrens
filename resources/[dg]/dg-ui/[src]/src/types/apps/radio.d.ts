declare namespace Radio {
  interface Info {
    frequency: number;
    enabled: boolean;
  }
  type State = Base.State & Info;
}
