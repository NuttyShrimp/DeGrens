declare type InteractionType = 'info' | 'success' | 'error';

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
  label: string;
}

declare namespace State {
  interface Base {
    visible: boolean;
  }

  interface BaseProps<T = any> {
    updateState: (data: Partial<T>) => { type: string; cb: Function };
  }

  namespace Main {
    interface State {
      currentApp: string;
      error: string | null;
      mounted: boolean;
    }

    interface Game {
      location: string;
      time: string;
      weather: string;
    }

    interface Aux {
      character: Character;
      game: Game;
    }
  }
}

// State
// TODO: add all state types
declare interface RootState {
  main: State.Main.State;
  character: Character;
  game: Game;
  contextmenu: ContextMenu.State;
  debuglogs: DebugLogs.State;
  financials: Financials.State;
  hud: Hud.State;
  input: InputMenu.State;
  interaction: Interaction.State;
  notifications: Notifications.State;
  phone: Phone.State;
  'phone.notifications': Phone.Notifications.State;
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
}
