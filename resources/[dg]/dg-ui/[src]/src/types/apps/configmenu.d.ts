declare namespace ConfigMenu {
  type Menu = 'hud' | 'phone' | 'radio';

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
    volume: {
      radio: number;
      phone: number;
    };
    balance: {
      radio: number;
      phone: number;
    };
  }

  interface Categories {
    hud: HudConfig;
    phone: PhoneConfig;
    radio: RadioConfig;
  }

  interface State extends Base.State, Categories {
    currentMenu: Menu;
  }
}
