declare namespace Laptop {
  interface State extends Base.State {
    activeApps: string[];
    focusedApp: string;
    notifications: Notification[];
  }

  interface AuxState {
    'laptop.config': Config.State;
  }

  interface Notification {
    id: string;
    app: string;
    message: string;
  }

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
      // padding to top in vh
      top: number;
      // padding to left in vh
      left: number;
      row: number;
      column: number;
      // Whitelisted for job and on-duty
      requiredJobs?: string[];
      // Blocked if whitelisted for job
      blockedJobs?: string[];
      requiresVPN?: boolean;
    }

    interface State {
      config: AppConfig[];
      enabledApps: AppConfig[];
    }
  }
}
