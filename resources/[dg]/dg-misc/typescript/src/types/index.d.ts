declare namespace Consumables {
  interface CState {
    alcohol: {
      count: number;
      thread: NodeJS.Timer | null;
      traits: {
        vehAction: number;
        stumble: number;
        puke: number;
        blackout: number;
      };
    };
  }
}
