declare type InteractionType = 'info' | 'success' | 'error';

declare type AppFunction<T = {}> = React.FC<
  T & {
    updateState: (data: Partial<T> | ((state: RootState) => Partial<RootState[T]>)) => void;
  }
>;

declare interface ConfigObject {
  name: keyof RootState;
  render: (p: any) => React.ReactElement<any, any>;
  type: 'passive' | 'interactive';
}

declare interface Character {
  cid: number;
  firstname: string;
  lastname: string;
  job: string;
  phone: string;
  server_id: number;
  hasVPN: boolean;
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
  label: string | JSX.Element;
}

declare namespace Base {
  interface State {
    visible: boolean;
  }

  interface Props<T = {}> extends T {
    updateState: (data: Partial<T>) => void;
  }
}

declare namespace Main {
  interface State {
    currentApp: string;
    error: string | null;
    mounted: boolean;
    apps: ConfigObject[];
  }

  interface Game {
    location: string;
    time: string;
    weather: string;
  }

  interface Aux {
    character: Character;
    game: Game;
    jobs: string[];
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
  input: InputMenu.State;
  interaction: Interaction.State;
  notifications: Notifications.State;
  cli: Base.State;
  taskbar: TaskBar.State;
  sliders: Sliders.State;
  scenes: Scenes.State;
  peek: Peek.State;
  phone: Phone.State;
  'phone.notifications': Phone.Notifications.State;
  'phone.apps.example': {};
  'phone.apps.contacts': Phone.Contacts.State;
  'phone.apps.crypto': Phone.Crypto.State;
  'phone.apps.gallery': Phone.Gallery.State;
  'phone.apps.home-screen': {};
  'phone.apps.info': {
    entries: Phone.Info.InfoAppEntry[];
  };
  'phone.apps.justice': Phone.Justice.State;
  'phone.apps.mail': Phone.Mail.State;
  'phone.apps.messages': Phone.Messages.State;
  'phone.apps.notes': Phone.Notes.State;
  'phone.apps.payconiq': Phone.PayConiq.State;
  'phone.apps.phone': Phone.Phone.State;
  'phone.apps.pinger': {};
  'phone.apps.twitter': Phone.Twitter.State;
  'phone.apps.yellowpages': Phone.YellowPages.State;
  'phone.apps.jobcenter': Phone.JobCenter.State;
  'phone.apps.debt': Phone.Debt.State;
  'phone.apps.business': Phone.Business.State;
  inventory: Inventory.State;
  itemboxes: Itemboxes.State;
  laptop: Laptop.State;
  'laptop.config': Laptop.Config.State;
  'laptop.gang': Laptop.Gang.State;
  'laptop.confirm': Laptop.Confirm.State;
  radio: Radio.State;
  configmenu: ConfigMenu.State;
}
