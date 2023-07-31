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

declare namespace Flyers {
  interface Flyer {
    id: number;
    cid: number;
    link: string;
    approved: number;
  }
  type UIFlyer = { type: 'police'; name: string } | { link: string };
}
