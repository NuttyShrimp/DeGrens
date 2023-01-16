declare namespace Hud {
  interface EntryUI {
    // FA icon
    name: string;
    color: string;
  }

  interface Entry {
    ui: EntryUI;
    name: string;
    enabled: boolean;
    steps: number;
    order: number;
  }

  interface Car {
    visible: boolean;
    speed: number;
    fuel: number;
    indicator: {
      belt: boolean;
      engine: boolean;
      service: boolean;
    };
  }

  interface Compass {
    visible: boolean;
    heading: number;
    street1: string;
    street2: string;
    area: string;
  }

  interface Cash {
    current: number;
    history: number[];
  }

  interface Voice {
    range: number;
    channel: number;
    active: boolean;
    // Talking on radio
    onRadio: boolean;
  }

  interface State {
    entries: Entry[];
    values: Record<string, number>;
    voice: Voice;
    car: Car;
    compass: Compass;
    cash: Cash;
  }

  interface StateActions {
    addEntry: (entry: Entry) => void;
    deleteEntry: (name: string) => void;
    toggleEntry: (name: string, enabled: boolean) => void;
  }
}
