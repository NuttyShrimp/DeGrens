import { mockEvent } from './nui-comms';

export const devData: Record<string, any> = {};

devData.contacts = [
  {
    id: 1,
    label: 'John Doe',
    phone: '0467227521',
  },
  {
    id: 2,
    label: 'Jane Doe',
    phone: '0467227522',
  },
  {
    id: 3,
    label: 'Jack Doe',
    phone: '0467227523',
  },
  {
    id: 4,
    label: 'Jill Doe',
    phone: '0467227524',
  },
  {
    id: 5,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 6,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 7,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 8,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 9,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 10,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 11,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 12,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 13,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 14,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 15,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 16,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 17,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
  {
    id: 18,
    label: 'Jenny Doe',
    phone: '0467227525',
  },
];

devData.messages = {
  '0467227521': [
    {
      id: 1,
      isread: true,
      isreceiver: true,
      message: 'message 1',
      date: 1638488727,
    },
    {
      id: 2,
      isread: true,
      isreceiver: false,
      message: 'message 2 look a this dog https://cdn.pixabay.com/photo/2019/10/10/11/36/dog-4539374_960_720.jpg',
      date: 1638488900,
    },
    {
      id: 3,
      isread: false,
      isreceiver: true,
      message: 'message 3',
      date: 1638489000,
    },
    {
      id: 4,
      isread: false,
      isreceiver: false,
      message: 'message 4',
      date: 1638489100,
    },
    {
      id: 5,
      isread: false,
      isreceiver: true,
      message: 'message 5',
      date: 1638489200,
    },
    {
      id: 6,
      isread: false,
      isreceiver: false,
      message: 'message 6',
      date: 1638489300,
    },
    {
      id: 7,
      isread: false,
      isreceiver: true,
      message: 'message 7',
      date: 1638489400,
    },
    {
      id: 8,
      isread: false,
      isreceiver: false,
      message: 'message 8',
      date: 1638489500,
    },
    {
      id: 9,
      isread: false,
      isreceiver: true,
      message: 'message 9',
      date: 1638489600,
    },
    {
      id: 10,
      isread: false,
      isreceiver: false,
      message: 'message 10',
      date: 1638489700,
    },
    {
      id: 11,
      isread: false,
      isreceiver: true,
      message: 'message 11',
      date: 1638489800,
    },
    {
      id: 12,
      isread: false,
      isreceiver: false,
      message: 'message 12',
      date: 1638489900,
    },
    {
      id: 13,
      isread: false,
      isreceiver: true,
      message: 'message 13',
      date: 1638490000,
    },
    {
      id: 14,
      isread: false,
      isreceiver: false,
      message: 'message 14',
      date: 1638490100,
    },
    {
      id: 15,
      isread: false,
      isreceiver: true,
      message: 'message 15',
      date: 1638490300,
    },
    {
      id: 16,
      isread: false,
      isreceiver: false,
      message: 'message 16',
      date: 1638490400,
    },
    {
      id: 17,
      isread: false,
      isreceiver: true,
      message: 'message 17',
      date: 1638490500,
    },
  ],
};

devData.YPListings = [
  {
    id: 1,
    phone: '0467227521',
    name: 'John Doe',
    text: 'My first ad https://inspyrus.com/wp-content/uploads/2016/08/cloud-image-1.jpg',
  },
  {
    id: 2,
    phone: '0467227522',
    name: 'Jane Doe',
    text: 'My Second super long ad with a nice emoji look --> 🚗 toet toet',
  },
];

devData.tweets = [
  {
    id: 1,
    sender_name: '@John_Doe',
    tweet: 'This is a tweet  https://i.redd.it/osiouuinz7881.jpg',
    date: 1638488727000,
    like_count: 2,
    retweet_count: 1,
    liked: false,
    retweeted: true,
  },
  {
    id: 2,
    sender_name: '@Jane_Doe',
    tweet: 'This is a tweet',
    date: 1638488727000,
    like_count: 11,
    retweet_count: 0,
    liked: true,
    retweeted: false,
  },
];

devData.notes = [
  {
    id: 1,
    title: 'My first note',
    date: 1638488727,
    note: '<p>My test note</p>',
  },
  {
    id: 2,
    title: 'Contract',
    date: 1638489000,
    note: '<p>This is a contract with alot of restrictions and useless text nobody understands</p>',
  },
];

devData.crypto = [
  {
    crypto_name: 'Manera',
    icon: 'mdi-alpha-m-circle-outline',
    value: 200,
    wallet: {
      cid: 'MNK81964',
      amount: 345,
      cname: 'Manera',
    },
  },
];

devData.bankTrans = [
  {
    accepted_by: 'Jane Doe',
    triggered_by: 'Default State',
    date: 1638489000,
    comment: 'Druggies',
    change: 100,
    transaction_id: 'ABC YOU DONT SEE ME',
  },
  {
    accepted_by: 'Default State',
    triggered_by: 'Jane Deo',
    date: 1638489000,
    comment: 'SUBPOENA ME',
    change: 17834,
    transaction_id: 'ABC YOU DONT SEE ME2',
  },
] as Phone.PayConiq.Transasction[];

devData.images = [
  {
    id: 1,
    src: 'https://i.imgur.com/p2AF1tL.jpg',
  },
  {
    id: 2,
    src: 'https://i.imgur.com/TJvF3KT.jpg',
  },
  {
    id: 3,
    src: 'https://i.imgur.com/1W5Io9e.jpg',
  },
  {
    id: 4,
    src: 'https://i.imgur.com/bswBJPK.jpg',
  },
  {
    id: 5,
    src: 'https://i.imgur.com/ISeGfCO.jpg',
  },
  {
    id: 6,
    src: 'https://i.imgur.com/u2N5k3z.jpg',
  },
  {
    id: 7,
    src: 'https://i.imgur.com/Rho7WGc.jpg',
  },
  {
    id: 8,
    src: 'https://i.imgur.com/UAAoJ51.jpg',
  },
  {
    id: 9,
    src: 'https://i.imgur.com/HsUDGTh.jpg',
  },
  {
    id: 10,
    src: 'https://i.imgur.com/WVC05JR.jpg',
  },
];

devData.justice = {
  judge: [
    {
      name: 'John doe',
      phone: '0467227521',
      available: true,
    },
    {
      name: 'David Achter',
      phone: '0487809321',
      available: true,
    },
  ],
  lawyer: [
    {
      name: 'Jane doe',
      phone: '0467227522',
      available: false,
    },
  ],
};

devData.financialsAccounts = [
  {
    account_id: 'BE01234566',
    name: 'Standard',
    balance: -1020.01,
    type: 'standard',
    permissions: {
      deposit: true,
      withdraw: true,
      transfer: true,
      transactions: true,
    },
  },
  {
    account_id: 'BE01234567',
    name: 'Me Savings',
    balance: 1478673.9,
    type: 'savings',
    permissions: {
      deposit: true,
      withdraw: false,
      transfer: false,
      transactions: true,
    },
    members: [
      { cid: 1005, name: 'Jan Janssens', deposit: true, withdraw: false, transfer: false, transactions: true },
      { cid: 1006, name: 'Peter Peeters', deposit: false, withdraw: true, transfer: true, transactions: true },
    ],
  },
  {
    account_id: 'BE01234568',
    name: 'Bank of America',
    balance: 67980.12,
    type: 'business',
    permissions: {
      deposit: true,
      withdraw: true,
      transfer: true,
      transactions: true,
    },
  },
];

devData.financialsTransactions = [
  {
    transaction_id: 'e418e011-54fc-49a6-968a-8e9197c2cb1b',
    origin_account_id: 'BE01234567',
    origin_account_name: 'Me Savings',
    origin_change: 120,
    target_account_id: 'BE01234568',
    target_account_name: 'Bank of America',
    target_change: 100,
    comment: 'Transfer to Bank of America',
    triggered_by: 'David Voor',
    accepted_by: null,
    date: 1641766054367,
    type: 'transfer',
  },
  {
    transaction_id: 'e418e011-54fc-49a6-968a-8e9197c2cb1X',
    origin_account_id: 'BE01234568',
    origin_account_name: 'Bank of America',
    origin_change: 200,
    target_account_id: 'BE01234567',
    target_account_name: 'Me Savings',
    target_change: 200,
    comment: 'Transfer to back to savings',
    triggered_by: 'De Staat',
    accepted_by: 'David Voor',
    date: 1641766054368,
    type: 'transfer',
  },
] as Financials.Transaction[];

devData.jobGroups = [
  {
    id: 'abc123',
    name: 'Jef klak',
    size: 1,
    limit: 3,
    idle: false,
  },
  {
    id: 'abc321',
    name: 'David Achter',
    size: 5,
    limit: 6,
    idle: true,
  },
];

devData.currentGroup = {
  id: 'abc123',
  name: 'Jef klak',
  size: 1,
  limit: 3,
};

devData.groupMembers = [
  {
    name: 'Jef Klak',
    ready: true,
    isOwner: true,
  },
  {
    name: 'Jan Janssens',
    ready: true,
    isOwner: false,
  },
  {
    name: 'Karen Kooper',
    ready: false,
    isOwner: false,
  },
  {
    name: 'Gangsta paradise',
    ready: false,
    isOwner: false,
  },
  {
    name: 'Aluminium',
    ready: false,
    isOwner: false,
  },
  {
    name: 'Christof rain',
    ready: false,
    isOwner: false,
  },
];

devData.jobs = [
  {
    name: 'sanitization',
    title: 'Vuilnis ophalen',
    level: 2,
    legal: true,
    icon: 'dumpster',
  },
  {
    name: 'fishing',
    title: 'Vissen',
    level: 6,
    legal: true,
    icon: 'fish',
  },
  {
    name: 'chopshop',
    title: 'ChopShop',
    level: 4,
    legal: false,
    icon: 'car-crash',
  },
];

devData.peekEntries = [
  {
    label: 'Open stash',
    icon: 'box-archive',
    id: '1',
  },
  {
    label: 'Repair vehicle',
    icon: 'car-wrench',
    id: '2',
  },
];

devData.phoneDebtEntry = [
  {
    id: 1,
    debt: 892312,
    payed: 0,
    expiry: 1663875123,
    type: 'debt',
    origin_name: 'BOZO was arrested',
    target: 'Unified Police Department',
  },
  {
    id: 2,
    debt: 4912,
    payed: 2049,
    expiry: 1662406323,
    type: 'maintenance',
    origin_name: 'Maintenance Fees',
    target: 'De staat',
  },
];

devData.hudEntries = [
  {
    ui: {
      name: 'microchip',
      color: '#4ECB71',
    },
    name: 'hack',
    enabled: true,
    steps: 15,
    order: 1,
  },
];

devData.hudValues = {
  health: 15,
  armor: 85,
  hunger: 60,
  thirst: 100,
  hack: 9,
};

devData.phoneBusinesses = [
  {
    id: 1,
    label: 'De FliereFluiters',
    role: 'Mechanieker',
    permissions: ['hire', 'property_access'],
    allPermissions: [
      'hire',
      'fire',
      'change_role',
      'pay_employee',
      'pay_external',
      'charge_external',
      'stash',
      'property_access',
    ],
  },
  {
    id: 2,
    label: 'Tuna shop',
    role: 'CEO',
    permissions: ['hire', 'fire', 'change_role', 'pay_employee', 'pay_external', 'charge_external'],
    allPermissions: ['hire', 'fire', 'change_role', 'pay_employee', 'pay_external', 'charge_external'],
  },
];

devData.phoneBusinessEmployees = [
  {
    name: '123',
    role: 'BOZO',
    citizenid: 1000,
    isOwner: true,
  },
  {
    name: 'You a Bish',
    role: 'Certified Karen',
    citizenid: 1001,
    isOwner: false,
  },
];

devData.phoneBusinessRoles = ['BOZO', 'Certified Karen', 'Rookie', 'Guest'];

const emulatedData: Record<
  string,
  {
    app: string;
    action?: string;
    appName?: string;
    data: any;
    // If true data must be array & event will be triggered for each entry in the data array with the given action & app
    iterateData?: boolean;
  }
> = {};
export const devDataEmulator = (appName: string) => {
  Object.keys(emulatedData).forEach(eventName => {
    const event = emulatedData[eventName];
    if (event.app !== appName) return;
    if (event.iterateData) {
      event.data.forEach((data: any) => {
        data.action = event.action;
        data.appName = event.appName;
        mockEvent(event.app, data);
      });
    } else {
      event.data.action = event.action;
      event.data.appName = event.appName;
      mockEvent(event.app, event.data);
    }
    console.log(`Emulated event: ${event.action} for ${event.app} (${eventName})`);
  });
};

emulatedData.initPhone = {
  app: 'phone',
  action: 'init',
  data: {},
};

emulatedData.phoneInfoApp = {
  app: 'phone',
  appName: 'info',
  action: 'registerInfoEntry',
  iterateData: true,
  data: [
    {
      data: {
        entry: {
          name: 'id',
          value: 183,
          icon: 'id-card',
          prefix: '#',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'phone',
          value: '0467227521',
          icon: 'hashtag',
          prefix: '',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'cash',
          value: 1672,
          icon: 'wallet',
          prefix: '€',
          color: '#81c784',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
    {
      data: {
        entry: {
          name: 'bank',
          value: 12783790,
          icon: 'piggy-bank',
          prefix: '€',
          color: '#64b5f6',
        },
      },
    },
  ],
};

emulatedData.newMail = {
  app: 'phone',
  appName: 'mail',
  action: 'newMail',
  iterateData: true,
  data: [
    {
      data: {
        message:
          "This some long ass mail with special info you really need to know to have alot of money in the city bcs that's important",
        subject: 'Nothing special',
        sender: 'My cock',
      },
    },
  ],
};

// emulatedData.phoneCall = {
//   app: 'phone',
//   appName: 'home-screen',
//   action: 'addNotification',
//   data: {
//     data: {
//       id: `devdata-phone-noti-1`,
//       title: 'Test Call',
//       icon: 'phone',
//       keepOnAction: true,
//       sticky: true,
//       onAccept: () => {},
//       onDecline: () => {},
//       description: 'in call...',
//       timer: 0,
//     },
//   },
// };

devData.inventory = {
  items: {
    microwave_000001: {
      id: 'microwave_000001',
      inventory: 'player_1001',
      position: { x: 0, y: 0 },
      size: { x: 4, y: 1 },
      name: 'microwave',
      label: 'Microwave',
      quality: 69,
      image: 'weapon_nightstick.png',
      description: 'Een apparaat om je identiteit geheim te houden terwijl je verbonden bent met een netwerk!',
      useable: true,
      closeOnUse: false,
      markedForSeizure: true,
      metadata: {},
    },
    phone_000001: {
      id: 'phone_000001',
      inventory: 'player_1001',
      position: { x: 1, y: 4 },
      size: { x: 4, y: 3 },
      name: 'phone',
      label: 'Phone',
      quality: 8,
      image: 'phone.png',
      description: 'Een hele mooie dure telefoon, gekregen van je oma.',
      useable: true,
      metadata: {
        pincode: '0128',
        number: '047124',
        serialnumber: '1256-ea45-ea5e-Ea3E',
        ammo: 216,
        hiddenKeys: ['hiddenKeys', 'pincode', 'ammo'],
      },
    },
    burger_000001: {
      id: 'burger_000001',
      inventory: 'player_1001',
      position: { x: 6, y: 1 },
      size: { x: 1, y: 1 },
      name: 'burger',
      label: 'Burger',
      quality: 100,
      image: 'burger.png',
      description: 'Lekkere mcdonalds burger hmmm',
      metadata: {},
    },
    burger_000002: {
      id: 'burger_000002',
      inventory: 'player_1001',
      position: { x: 8, y: 10 },
      size: { x: 1, y: 1 },
      name: 'burger',
      label: 'Burger',
      quality: 50,
      image: 'burger.png',
      description: 'Lekkere mcdonalds burger hmmm',
      metadata: {},
    },
    burger_000003: {
      id: 'burger_000003',
      inventory: 'shop_1abc123',
      position: { x: 0, y: 0 },
      size: { x: 1, y: 1 },
      name: 'burger',
      label: 'Burger',
      quality: 5,
      image: 'burger.png',
      description: 'Lekkere mcdonalds burger hmmm',
      metadata: {},
      requirements: {
        cash: 100,
      },
    },
    phone_100003: {
      id: 'phone_100003',
      inventory: 'shop_1abc123',
      position: { x: 2, y: 2 },
      size: { x: 2, y: 2 },
      name: 'phone',
      label: 'Telefoon',
      quality: 100,
      image: 'phone.png',
      description: 'Mooie telefoon',
      metadata: {},
    },
    phone_100043: {
      id: 'phone_100043',
      inventory: 'shop_1abc123',
      position: { x: 5, y: 3 },
      size: { x: 2, y: 2 },
      name: 'phone',
      label: 'Telefoon',
      quality: 100,
      image: 'phone.png',
      description: 'Mooie telefoon',
      metadata: {},
      requirements: {
        cash: 159,
        items: [
          { name: 'vpn', label: 'VPN' },
          { name: 'phone', label: 'Telefoon' },
        ],
      },
    },
  },
  primary: {
    id: 'player_1001',
    size: 25,
    cash: 169,
  },
  secondary: {
    id: 'shop_1abc123',
    size: 10,
    allowedItems: [],
  },
};
