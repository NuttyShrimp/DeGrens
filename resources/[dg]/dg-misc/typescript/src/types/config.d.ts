declare namespace Config {
  interface PhoneConfig {
    background: {
      phone: string;
      laptop: string;
    };
    notifications: {
      twitter: boolean;
    };
  }

  interface HudConfig {
    sections: {
      health: boolean;
      food: boolean;
    };
    compass: {
      // toggle show when in vehicles
      show: boolean;
      fps: number;
    };
  }

  interface Clicks {
    incoming: boolean;
    outgoing: boolean;
  }

  interface RadioConfig {
    clicks: {
      enabled: boolean;
      me: Clicks;
      someElse: Clicks;
    };
    volume: number;
    balance: number;
  }

  interface Categories {
    hud: HudConfig;
    phone: PhoneConfig;
    radio: RadioConfig;
  }


  interface Consumable {
    name: string;
    gain: number;
  }

  interface Consumables {
    drink: {
      normal: Consumable[];
      alcohol: Consumable[];
    };
    food: Consumable[];
  }
}
