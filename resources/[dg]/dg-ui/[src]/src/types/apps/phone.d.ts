declare namespace Phone {
  interface State extends Base.State {
    animating: 'closed' | 'peek' | 'open';
    hasNotifications: boolean;
    callActive: boolean;
    isSilent: boolean;
    inCamera: boolean;
    activeApp: string;
    callMeta: any;
    background: Object;
    bigPhoto: string | null;
  }

  interface AuxState {
    'phone.form': FormState;
    'phone.notifications': Notifications.State;
  }

  interface Props extends State {
    character: Character;
    game: Main.Game;
  }

  // region Config
  type Event = (data: any) => void;
  type Events = {
    [eventName: string]: Event;
  };

  interface Icon {
    name: string;
    color?: string;
    background?: string;
    backgroundGradient?: string;
    size?: string;
    /**
     * Define a custom library for icons
     * @default 'fas fa-'
     */
    lib?: string;
  }

  // endregion
  //region OS
  interface TopContent extends Base.Props {
    weather: string;
  }

  namespace AppContainer {
    interface Search {
      list: any[];
      filter: (Function | string)[];
      onChange: (list: any[]) => void;
    }

    interface Input {
      value: string;
      onChange: (value: string) => void;
      label?: string;
      icon?: string;
    }

    interface Props {
      onClickBack?: () => void;
      /**
       * Styling on root of wrapper
       */
      style?: Object;
      /**
       * Styling on parent of children
       */
      containerStyle?: Object;
      /**
       * Set class of root of wrapper
       */
      className?: string;
      /**
       * Set class of parent of children
       */
      containerClassName?: string;
      search?: Search;
      input?: Input;
      primaryActions?: Action[];
      auxActions?: Action[];
      emptyList?: boolean;
    }
  }

  namespace Notifications {
    interface Icon {
      name: string;
      color: string;
      background: string;
      backgroundGradient?: string;
      lib?: string;
      size?: number;
    }

    interface Notification {
      // Unique Id so we can change te notification when visible when this would be needed (think about calls)
      id: string;
      title: string;
      description: string;
      // No timeout will be started but the notification will be removed upon action
      sticky?: boolean;
      // Does not remove the notification when accepted/declined
      keepOnAction?: boolean;
      // Can be an appName or a custom icon
      icon: Icon;
      // String is for external usage, Function should only be use inside this vue project so we don't need to capture unnecessary events
      onAccept?: string | Function;
      onDecline?: string | Function;
      _data?: any;
      timer?: number;
      app?: string;
    }

    interface State {
      list: Notification[];
    }
  }

  interface FormState {
    visible: boolean;
    element: React.ReactElement<any> | null;
    checkmark: boolean;
    warning: boolean;
  }

  //endregion
  // region Apps
  namespace Info {
    interface InfoAppEntry {
      name: string;
      value: string | number;
      icon: string;
      color?: string;
      prefix?: string;
    }

    interface Props {
      entries: InfoAppEntry[];
    }
  }
  namespace Contacts {
    interface Contact {
      id: number;
      label: string;
      phone: string;
    }

    interface State {
      contacts: Contact[];
    }
  }
  namespace Messages {
    interface Message {
      id: number;
      isreceiver: boolean;
      message: string;
      isread: boolean;
      date: number;
    }

    interface State {
      hasNotification: boolean;
      messages: Record<string, Message[]>;
      currentNumber: string | null;
    }
  }
  namespace Phone {
    interface Call {
      name?: string;
      number?: string;
      // UNIX timestamp
      date: number;
      incoming: boolean;
    }

    interface State {
      calls: Call[];
    }

    interface CallMeta {
      number?: string;
      isAnon?: boolean;
    }
  }
  namespace Mail {
    interface Mail {
      id: string;
      sender: string;
      subject: string;
      message: string;
      date: number;
    }

    interface State {
      hasNotification: boolean;
      mails: Mail[];
    }
  }
  namespace YellowPages {
    interface Ad {
      id: number;
      text: string;
      name: string;
      phone: string;
    }

    interface State {
      list: Ad[];
      current: Ad | null;
    }
  }
  namespace Twitter {
    interface Tweet {
      id: number;
      tweet: string;
      date: number;
      sender_name: string;
      like_count: number;
      retweet_count: number;
      liked: boolean;
      retweeted: boolean;
    }

    interface State {
      tweets: Tweet[];
      /**
       * Amount of reauest has been made to fetch tweets
       */
      requestAmount: number;
    }
  }
  namespace Notes {
    interface Note {
      id: number;
      title: string;
      note: string;
      date: number;
      readonly?: boolean;
    }

    interface State {
      list: Note[];
      current: Note | null;
    }
  }
  namespace Crypto {
    interface Coin {
      icon: string;
      crypto_name: string;
      value: number;
      wallet: {
        cname: string;
        amount: number;
        cid: string;
      };
    }

    interface State {
      list: Coin[];
      shouldRenew: boolean;
    }
  }
  namespace PayConiq {
    interface Transasction {
      transaction_id: string;
      change: number;
      comment: string;
      // Name of characters
      triggered_by: string;
      accepted_by: string;
      // UNIX timestamp
      date: number;
    }

    interface State {
      list: Transasction[];
      dirty: false;
    }
  }
  namespace Gallery {
    interface Img {
      id: number;
      link: string;
    }

    interface State {
      list: Img[];
    }
  }
  namespace Justice {
    interface Person {
      name: string;
      phone: string;
      available: boolean;
    }

    interface State {
      list: Record<string, Person[]>;
    }

    interface Props extends State {
      character: Character;
    }
  }
  namespace JobCenter {
    interface Group {
      id: string;
      name: string;
      size: number;
      limit: number;
      idle: boolean;
    }

    interface Member {
      name: string;
      ready: boolean;
      isOwner: boolean;
    }

    interface Job {
      name: string;
      title: string;
      level: number;
      legal: boolean;
      icon: string;
    }

    interface State {
      jobs: Job[];
      groups: Group[];
      currentGroup: Group | null;
      groupMembers: Member[];
      isOwner: boolean;
      isReady: boolean;
    }
  }
  namespace Debt {
    interface Debt {
      id: number;
      debt: number;
      payed: number;
      // unix timestamp IN SECONDS
      date: number;
      type: 'debt' | 'maintenance';
      // Name of account where debt goes to
      target_account: string;
      origin_name: string;
      reason: string;
    }

    interface State {
      list: Debt[];
    }
  }
  namespace Business {
    interface Business {
      id: number;
      label: string;
      role: string;
      // My permissions
      permissions: string[];
      allPermissions: string[];
    }

    interface Employee {
      name: string;
      role: string;
      citizenid: number;
      isOwner: boolean;
      bank: Financials.AccountPermission;
    }

    interface Log {
      id: number;
      // Name behind citizenid from DB
      name: string;
      type: string;
      // msg
      action: string;
    }

    interface State {
      list: Business[];
      employees: Employee[];
      currentBusiness: number | null;
      activeApp: 'business' | 'employee' | 'log';
      // Available roles for current selected business
      roles: Record<strimg, string[]>;
      permissionLabels: Record<string, string>;
      logs: Log[];
    }
  }
  // endregion
}
