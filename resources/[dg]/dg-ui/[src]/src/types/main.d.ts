declare type InteractionType = 'info' | 'success' | 'error';
declare type UpdateState<T> = (state: Partial<T>) => void;

declare type AppFunction = React.FC<{
  showApp: () => void;
  hideApp: () => void;
}>;

declare interface ConfigObject {
  name: keyof RootState;
  render: (p: any) => React.ReactElement<any, any>;
  type: 'passive' | 'interactive' | (() => 'passive' | 'interactive');
}

declare interface Character {
  cid: number;
  firstname: string;
  lastname: string;
  job: string;
  phone: string;
  server_id: number;
  hasVPN: boolean;
  hasPhone: boolean;
  cash: number;
  isAdmin: boolean;
}

interface Action {
  title: string;
  icon: string;
  iconLib?: string;
  data?: any;
  onClick: (data?: any) => void;
}

interface ListItem {
  icon?: string;
  size?: string;
  onClick?: (data: any) => void;
  data?: any;
  label: string | JSX.Element;
}

declare namespace Main {
  interface State {
    currentApp: string;
    error: string | null;
    mounted: boolean;
    apps: ConfigObject[];
    character: Character;
    game: Game;
    jobs: string[];
  }

  interface StateActions {
    setCurrentApp: (app: keyof RootState | '') => void;
    setApps: (app: ConfigObject[]) => void;
    // Set errors and unmounts
    setError: (err: string | null) => void;
    removeError: () => void;
    setCharacter: (char: Character) => void;
    setTime: (time: string) => void;
    setWeather: (weather: string) => void;
  }

  interface Game {
    location: string;
    time: string;
    weather: string;
  }
}

// State
declare interface RootState {
  main: Main.State;
  character: Character;
  game: Game;
  contextmenu: ContextMenu.State;
  debuglogs: DebugLogs.State;
  financials: Financials.State;
  hud: Hud.State;
  input: null;
  interaction: Interaction.State;
  notifications: Notifications.State;
  cli: null;
  taskbar: TaskBar.State;
  sliders: null;
  scenes: null;
  peek: Peek.State;
  bennys: Bennys.State;
  phone: Phone.State;
  inventory: Inventory.State;
  itemboxes: Itemboxes.State;
  laptop: Laptop.State;
  radio: Radio.State;
  configmenu: ConfigMenu.State;
  keygame: Keygame.State;
  gridgame: Gridgame.State;
  dispatch: Dispatch.State;
  policeradar: null;
  flyer: Badge.State;
  idlist: null;
  reports: Reports.State;
  'reports-indicator': ReportIndicator.State;
  keypad: null;
  racing: Racing.State;
}
