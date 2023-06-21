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
    checkQuality?: boolean;
  }

  interface EffectConsumable {
    name: string;
    effect: 'speed' | 'damage';
    duration: number;
  }

  type StressConsumable = {
    name: string;
    decrease: number;
    duration: number;
    uses: number;
    animation: (
      | {
          dict: string;
          name: string;
          flag: number;
          prop?: string;
        }
      | { scenario: string }
    ) & {
      duration: number;
    };
  };

  interface Consumables {
    drink: {
      normal: Consumable[];
      alcohol: Consumable[];
    };
    food: Consumable[];
    drugs: EffectConsumable[];
    stress: StressConsumable[];
  }

  namespace Seats {
    interface Seat {
      model: string | number;
      offset: Vec3;
    }
    interface Config {
      seats: Seat[];
    }
  }
}
