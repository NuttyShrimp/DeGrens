declare namespace Laptop {
  interface State extends Base.State {
    activeApps: string[];
    focusedApp: string;
    notifications: Notification[];
    windowPositions: Record<string, { x: number; y: number }>;
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

  namespace Confirm {
    type State = { data: Data | null };

    type Data = {
      label: string;
      onAccept: () => void;
      onDecline?: () => void;
    };
  }
}
