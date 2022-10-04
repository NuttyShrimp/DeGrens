export const defaultState: Record<string, any> = {};

defaultState.character = {
  serverId: 1,
  cid: 1000,
  firstname: 'Default',
  lastname: 'State',
  phone: '0412345678',
  job: 'judge',
  server_id: 1,
  hasVPN: true,
} as Character;

defaultState.hud = {
  compass: {
    visible: true,
    heading: 60,
    street: 'Not a street',
    zone: 'Not a zone',
  },
  values: {
    health: {
      enabled: true,
      value: 75,
    },
    armor: {
      enabled: true,
      value: 100,
    },
    hunger: {
      enabled: true,
      value: 100,
    },
    thirst: {
      enabled: true,
      value: 100,
    },
    air: {
      enabled: true,
      value: 100,
    },
  },
  voice: {
    normal: true,
    onRadio: false,
  },
};

defaultState.contextmenu = [
  {
    id: '1',
    title: 'Context Menu Item 1',
    icon: 'cog',
    callbackURL: 'test-url',
  },
  {
    id: '2',
    title: 'Context Menu Item 2',
    icon: 'cog',
    callbackURL: 'test-url',
  },
  {
    id: '3',
    title: 'Context Menu Item 3',
    description: 'This is a description',
    callbackURL: 'test-url',
    disabled: true,
  },
  {
    id: '4',
    title: 'Context Menu Item 4',
    icon: 'cog',
    callbackURL: 'test-url',
    submenu: [
      {
        id: '4.1',
        title: 'Context Menu Item 4.1',
        icon: 'cog',
        callbackURL: 'test-url',
      },
    ],
  },
  {
    id: '5',
    title: 'Context Menu Item 5',
    icon: 'cog',
    callbackURL: 'test-url',
    submenu: [
      {
        id: '5.1',
        title: 'Context Menu Item 5.1',
        icon: 'cog',
        submenu: [],
      },
    ],
  },
  {
    id: '6',
    title: 'Filler',
    icon: 'cog',
    callbackURL: 'test-url',
  },
  {
    id: '7',
    title: 'Filler',
    icon: 'cog',
    callbackURL: 'test-url',
  },
  {
    id: '8',
    title: 'Filler',
    icon: 'cog',
    callbackURL: 'test-url',
  },
  {
    id: '9',
    title: 'Filler',
    icon: 'cog',
    callbackURL: 'test-url',
  },
  {
    id: '10',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '11',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '12',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '13',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '14',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '15',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '16',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '17',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '18',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '19',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '20',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '21',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '22',
    title: 'Filler',
    callbackURL: 'test-url',
  },
  {
    id: '23',
    title: 'Filler',
    callbackURL: 'test-url',
  },
] as ContextMenu.Entry[];

defaultState.financials = {
  isAtm: false,
  bank: 'fleeca',
  cash: 343578,
} as Financials.BaseInfo;
