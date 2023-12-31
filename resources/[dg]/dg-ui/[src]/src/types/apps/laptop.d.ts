declare namespace Laptop {
  type WindowPos = { x: number; y: number };
  interface State {
    activeApps: string[];
    focusedApp: string;
    notifications: Notification[];
    windowPositions: Record<string, WindowPos>;
  }

  interface StateActions {
    setFocusedApp: (app: string) => void;
    addNotification: (notification: Notification) => void;
    removeNotification: (id: string) => void;
    addActiveApp: (app: string) => void;
    removeActiveApp: (app: string) => void;
    setWindowPosition: (app: string, position: WindowPos) => void;
  }

  interface Notification {
    id: string;
    app: string;
    message: string;
  }

  type BackgroundIcon = {
    name: string;
    x: number;
    y: number;
    icon: Config.Icon;
    label: string;
  };

  namespace Config {
    interface BaseIcon {
      background?: string;
      size?: string;
    }

    interface ElemIcon extends BaseIcon {
      element: React.ReactElement;
    }

    interface NameIcon extends BaseIcon {
      name: string;
      color?: string;
      /**
       * Define a custom library for icons
       * @default 'fas fa-'
       */
      lib?: string;
    }

    type Icon = NameIcon | ElemIcon;

    interface Config {
      name: string;
      label: string;
      icon: Icon;
      render: (p: any) => React.ReactElement<any, any>;
      iconPosition?: {
        row: number;
        column: number;
      };
      // Whitelisted for job and on-duty
      requiredJobs?: string[];
      // Blocked if whitelisted for job
      blockedJobs?: string[];
      requiresVPN?: boolean;
      important?: boolean; // If true, every other action will be blocked while app is open
    }

    interface State {
      config: AppConfig[];
      enabledApps: AppConfig[];
    }
  }

  namespace Gang {
    type State = {
      name: string;
      label: string;
      members: Member[];
      feedMessages: Gangs.Feed.Message[];
    };

    type Member = {
      name: string;
      cid: number;
      hasPerms: boolean;
      isOwner: boolean;
      isPlayer: boolean; // indicates if it is urself
    };

    type Tab = 'home' | 'members' | 'feed';

    type FeedMsg = {
      id: number;
      message: string;
      sender: string;
      date: number;
    };
  }

  namespace Confirm {
    type State = { data: Data | null };

    interface StateActions {
      setData: (data: Data | null) => void;
    }

    type Data = {
      label: string;
      onAccept: () => void;
      onDecline?: () => void;
    };
  }

  namespace Bennys {
    type Category = 'cosmetic' | 'illegal';

    interface State {
      activeTab: string;
      items: Item[];
      cart: Record<string, number>;
    }

    interface StateActions {
      setItems: (items: Item[]) => void;
      setActiveTab: (tab: string) => void;
      setCart: (cart: Record<string, number>) => void;
    }

    interface Item {
      item: string;
      label: string;
      price: number;
      category: Category;
      image: string;
    }
  }

  namespace Carboosting {
    type State = {
      signedUp: boolean;
      contracts: Contract[];
      reputation: {
        percentage: number;
        currentClass: string;
        nextClass?: string;
      };
    };

    type StateActions = {
      fetchData: () => void;
    } & Store.UpdateStore<State>;

    type Contract = {
      id: number;
      class: string;
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
