declare namespace ConfigMenu {
  type Menu = 'hud' | 'phone' | 'radio' | 'sounds';

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
    keyboard: 'azerty' | 'qwerty';
    size: number;
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

  type SoundsConfig = {
    interactionSoundVolume: number;
  };

  interface Categories {
    hud: HudConfig;
    phone: PhoneConfig;
    radio: RadioConfig;
    sounds: SoundsConfig;
  }

  interface State extends Categories {
    currentMenu: Menu;
  }

  interface StateActions {
    setMenu: (menu: Menu) => void;
    setConfig: (conf: Categories) => Categories;
    updateConfig: <T extends keyof Categories>(cKey: T, data: Partial<Categories[T]>) => void;
    saveConfig: () => void;
  }
}
