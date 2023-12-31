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
    description: string;
    approved: number;
  }
  type UIFlyer = { type: 'police'; name: string } | { link: string };
}

declare namespace Notes {
  interface Note {
    id: number;
    note: string;
    creator: number;
    last_editor: number;
    coords: Vec3;
  }
}
