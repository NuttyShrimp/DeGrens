declare namespace Carboosting {
  type Config = {
    classes: Record<Vehicles.Class, ClassConfig>;
    contracts: {
      interval: {
        personal: number; // minutes
        global: number; // minutes
      };
      groupReputationPercentage: number; // percentage of rep groupmembers get
      finishRewardPriceMultiplier: number; // multiplier of price received succesfully finished
    };
    locations: LocationConfig[];
    dropoffs: Record<DropoffType, Vec4[]>;
  };

  type ClassConfig = {
    reputation: {
      required: number;
      increase: number;
      decrease: number;
    };
    contractType: Contracts.Type;
    chances: {
      dispatch: number; // chance dispatch alert gets send when lockpicking
      tracker: number; // chance tracker gets added when lockpicking
      guards: number; // chance guards spawn
      tunes: number; // chance vehicle spawns with performance tunes
      contract: number; // chance actual contract gets added when this class is choosen
    };
    expirationTime: number; // minutes before contracts gets auto deleted
    timeoutAfterAccepting?: number; // class timeout after accepting a contract
    price: Record<DropoffType, number>;
    radiusBlipSize: number;
    tracker: {
      delay: number; // initial delay in ms
      increase: number; // delay increase after each hack
      amount: number; // amount of hacks required to remove
      cooldown: number; // cooldown in ms tussen hacks
      hack: {
        gridSize: number;
        length: number;
        displayTime: number;
        inputTime: number;
      };
    };
    guards: {
      models: string[];
      amount: number;
      weapons: string[];
    };
  };

  type LocationConfig = {
    vehicle: Vec4;
    npcs: Vec4[];
    classes: Vehicles.Class[];
    doorNames?: string[];
  };

  type UIData = {
    signedUp: boolean;
    contracts: Contracts.UIData[];
    reputation: {
      percentage: number;
      currentClass: string;
      nextClass?: string;
    };
  };

  type ClientActionData = {
    vehicleLocation?: Vec4;
    radiusBlip?: {
      coords: Vec3;
      size: number;
    };
    dropoff?: {
      coords: Vec4;
      type: Carboosting.DropoffType;
    };
    addNotification?: Phone.Notification;
    removeNotification?: string;
    mail?: Pick<Phone.Mails.MailData, 'message' | 'coords'>;
  };

  type DropoffType = 'boost' | 'scratch';

  namespace Contracts {
    type Type = 'personal' | 'global';

    type UIData = {
      id: number;
      class: Vehicles.Class;
      brand: string;
      name: string;
      expirationTime: number;
      price: {
        boost: number;
        scratch: number;
      };
      disabledActions: {
        boost: boolean;
        scratch: boolean;
        decline: boolean;
      };
    };
  }
}
