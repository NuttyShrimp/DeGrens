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
    account_id: 'BE01234566E',
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
    account_id: 'BE01234566D',
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
    account_id: 'BE01234566C',
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
    account_id: 'BE01234566B',
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
    account_id: 'BE01234566A',
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

devData.genericData = {
  interior: [
    { name: 'subwoofer', equipped: 0, componentNames: ['Subwoofer #1', 'Subwoofer #2'] },
    { name: 'trimA', equipped: 2, componentNames: ['Trim A #1', 'Trim A #2', 'Trim A #3', 'Trim A #4'] },
    {
      name: 'ornaments',
      equipped: 1,
      componentNames: ['Ornaments #1', 'Ornaments #2', 'Ornaments #3', 'Ornaments #4'],
    },
  ],
  exterior: [
    {
      name: 'spoiler',
      equipped: -1,
      componentNames: [
        'Standard',
        'Short Lip Spoiler',
        'Extended Lip Spoiler',
        'Bolt-On Ducktail',
        'Drag Spoiler',
        'Stock Car Spoiler',
        'Mid Level Spoiler',
        'Carbon Flap Spoiler',
        'Low Spoiler',
        'Low Carbon Spoiler',
        'Classic RS Wing',
        'Carbon Classic RS Wing',
        'Tuner Wing',
        'Carbon Wing Type II',
        'Extreme Downforce BGW',
        'Muscle Killer Wing',
        'Drift Wing',
        'GT Wing',
        'Tarmac Attack Wing',
        'Extreme Street Racer Wing',
        'Extreme Time Attack Wing',
      ],
    },
    {
      name: 'frontBumper',
      equipped: -1,
      componentNames: [
        'Standard',
        'Stickerbomb Splitter',
        'Carbon Front Splitter',
        'Painted Extended Splitter',
        'Black Extended Splitter',
        'Extended Front Diffuser',
        'Splitter With Canards',
      ],
    },
    {
      name: 'rearBumper',
      equipped: -1,
      componentNames: ['Standard', 'Carbon Rear Diffuser', 'Carbon Track Diffuser', 'Carbon Race Diffuser'],
    },
    {
      name: 'sideSkirt',
      equipped: -1,
      componentNames: [
        'Standard',
        'Sideskirt Extensions',
        'Secondary Skirt Extensions',
        'Carbon Skirt Extensions',
        'Drift Skirts',
        'Secondary Drift Skirts',
      ],
    },
    {
      name: 'exhaust',
      equipped: -1,
      componentNames: [
        'Standard',
        'Chrome Tip Exhaust',
        'Big Bore Exhaust',
        'Race Exhaust',
        'Oval Exhaust',
        'Titanium Exhaust',
        'Titanium Tuner Exhaust',
        'Twin Chrome Tip Exhaust',
        'Twin Titanium Exhaust',
        'Twin Titanium Tuner Exhaust',
      ],
    },
    {
      name: 'frame',
      equipped: -1,
      componentNames: [
        'Standard',
        'Street Half Cage',
        'Dash Dodger Cage',
        'Padded Dash Dodger Cage',
        'Full Roll Cage',
        'Padded Full Roll Cage',
      ],
    },
    {
      name: 'grille',
      equipped: -1,
      componentNames: ['Standard', 'Secondary Grille Surround', 'Black Grille Surround', 'Carbon Grille Surround'],
    },
    {
      name: 'livery',
      equipped: -1,
      componentNames: [
        'Standard',
        'White Stripes',
        'Black Stripes',
        'Not Tonight Pizzaboy',
        'Midnight Racer',
        'Battle Damaged',
        'Drift Missile',
        'Redwood Racing',
        'LTD Gasoline',
        'Meinmacht',
      ],
    },
    {
      name: 'plateColor',
      equipped: 0,
      componentNames: ['Blue/White', 'Yellow/black', 'Yellow/Blue', 'Blue/White2', 'Blue/White3', 'Yankton'],
    },
  ],
  colors: [
    { name: 'primaryColor', equipped: 0 },
    { name: 'secondaryColor', equipped: { r: 255, g: 255, b: 255 } },
    { name: 'pearlescentColor', equipped: 11 },
    { name: 'interiorColor', equipped: 11 },
    { name: 'dashboardColor', equipped: 11 },
    { name: 'wheelColor', equipped: 11 },
  ],
};

devData.wheelData = {
  equipped: {
    type: 6,
    id: -1,
  },
  categories: [
    {
      id: 2,
      label: 'Fietswiel',
      componentNames: ['Fietswiel #1', 'Fietswiel #2', 'Fietswiel #3'],
    },
    {
      id: 6,
      label: 'Bike',
      componentNames: ['Bike #1', 'Bike #2', 'Bike #3', 'Bike #4', 'Bike #5', 'Bike #6', 'Bike #7'],
    },
  ],
};

devData.extraData = [
  {
    id: 1,
    enabled: true,
  },
  {
    id: 2,
    enabled: false,
  },
  {
    id: 7,
    enabled: false,
  },
  {
    id: 8,
    enabled: true,
  },
];

devData.bennysPrices = {
  spoiler: 1000,
  frontBumper: 1000,
  rearBumper: 1000,
  sideSkirt: 1000,
  exhaust: 800,
  frame: 1000,
  grille: 800,
  hood: 1000,
  leftFenders: 1000,
  rightFenders: 1000,
  roof: 1000,
  horn: 250,
  subwoofer: 750,
  plateHolder: 750,
  vanityPlate: 750,
  trimA: 800,
  ornaments: 550,
  dashboard: 750,
  dial: 500,
  doorSpeakers: 750,
  seats: 850,
  steeringWheel: 750,
  shiftLever: 750,
  plaques: 750,
  speakers: 800,
  trunk: 1000,
  trimB: 1000,
  engineHydraulics: 1000,
  engineBlock: 1000,
  airFilter: 750,
  struts: 800,
  archCover: 1000,
  aerials: 1000,
  tank: 750,
  door: 1000,
  tyreSmokeColor: 1500,
  wheels: 1000,
  primaryColor: 1500,
  secondaryColor: 1000,
  pearlescentColor: 750,
  interiorColor: 500,
  dashboardColor: 500,
  wheelColor: 750,
  extras: 500,
  livery: 1500,
  plateColor: 500,
};

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

devData.bennyLaptopItems = [
  {
    item: 'xenon_lights',
    label: 'Xenon lamp',
    image: 'xenon_lights.png',
    price: 40,
    category: 'cosmetic',
  },
  {
    item: 'neon_strip',
    label: 'Neon Strip',
    image: 'neon_strip.png',
    price: 20,
    category: 'cosmetic',
  },
  {
    item: 'rgb_controller',
    image: 'rgb_controller.png',
    label: 'RGB Controller',
    price: 10,
    category: 'cosmetic',
  },
  {
    item: 'harness',
    image: 'harness.png',
    label: 'Harnas',
    price: 40,
    category: 'cosmetic',
  },
  {
    item: 'cleaning_kit',
    image: 'cleaning_kit.png',
    label: 'Schoonmaakset',
    price: 10,
    category: 'cosmetic',
  },
  {
    item: 'vehicle_wax',
    image: 'vehicle_wax.png',
    label: 'Voertuig Wax',
    price: 25,
    category: 'cosmetic',
  },
  {
    item: 'fakeplate',
    label: 'Fake Plate',
    image: 'plate.png',
    price: 200,
    category: 'illegal',
  },
  {
    item: 'window_tint',
    label: 'Tint Folie',
    image: 'window_tint.png',
    price: 60,
    category: 'illegal',
  },
  {
    item: 'nos',
    label: 'NOS',
    image: 'nos.png',
    price: 50,
    category: 'illegal',
  },
];

devData.phoneVehicles = [
  {
    name: 'GT63',
    brand: 'Mercedes',
    plate: 'ABC13494',
    vin: '8908837jwqe2390fh90uedfhdfvs',
    parking: 'Alta Street Apartments',
    state: 'parked',
    engine: 1000,
    body: 1000,
  },
  {
    name: 'GTR',
    brand: 'Nissan',
    plate: 'crzr',
    vin: 'f9090df889u34rtu9rjjioop23',
    parking: 'Bozo park',
    state: 'out',
    engine: 100,
    body: 703,
  },
];

devData.dispatchCalls = [
  {
    id: '123',
    title: 'An incoming 112 Call',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    tag: '112',
    timestamp: 1667678087200,
  },
  {
    title: '10-13A',
    callsign: '100',
    entries: {
      'id-card-clip': 'BOZO went down :clown:',
    },
    coords: { x: 0, y: 0, z: 0 },
    id: '124',
    timestamp: 1667678087201,
  },
  {
    title: 'Suspicious trade in broaddaylight in da streets of Los Santos',
    callsign: '100',
    entries: {
      'id-card-clip': 'BOZO went down :clown:',
    },
    coords: { x: 0, y: 0, z: 0 },
    id: '124',
    important: true,
    timestamp: 1667678087221,
  },
] as Dispatch.Call[];

devData.dispatchCams = [
  {
    id: 1,
    label: 'Pacific Bank #1',
  },
  {
    id: 2,
    label: 'Pacific Bank #2',
  },
  {
    id: 3,
    label: 'Paleto Bank #1',
  },
  {
    id: 4,
    label: 'Paleto Bank #2',
  },
] as Dispatch.Cam[];

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
      inventory: 'player__1001',
      position: { x: 0, y: 0 },
      size: { x: 4, y: 1 },
      rotated: false,
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
      inventory: 'player__1001',
      position: { x: 1, y: 4 },
      size: { x: 4, y: 3 },
      rotated: false,
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
      inventory: 'player__1001',
      position: { x: 6, y: 1 },
      size: { x: 1, y: 1 },
      rotated: false,
      name: 'burger',
      label: 'Burger',
      quality: 100,
      image: 'burger.png',
      description: 'Lekkere mcdonalds burger hmmm',
      metadata: {},
    },
    burger_000002: {
      id: 'burger_000002',
      inventory: 'player__1001',
      position: { x: 8, y: 10 },
      size: { x: 1, y: 1 },
      rotated: false,
      name: 'burger',
      label: 'Burger',
      quality: 50,
      image: 'burger.png',
      description: 'Lekkere mcdonalds burger hmmm',
      metadata: {},
    },
    burger_000003: {
      id: 'burger_000003',
      inventory: 'stash__1abc123',
      position: { x: 1, y: 1 },
      size: { x: 2, y: 2 },
      rotated: false,
      name: 'burger',
      label: 'Burger',
      quality: 50,
      image: 'burger.png',
      description: 'Lekkere mcdonalds burger hmmm',
      metadata: {},
    },
    burger_000004: {
      id: 'burger_000004',
      inventory: 'stash__1abc123',
      position: { x: 3, y: 3 },
      size: { x: 2, y: 2 },
      rotated: false,
      name: 'burger',
      label: 'Burger',
      quality: 50,
      image: 'burger.png',
      description: 'Lekkere mcdonalds burger hmmm',
      metadata: {},
    },
    burger_000005: {
      id: 'burger_000005',
      inventory: 'stash__1abc123',
      position: { x: 5, y: 6 },
      size: { x: 2, y: 2 },
      rotated: false,
      name: 'burger',
      label: 'Burger',
      quality: 50,
      image: 'burger.png',
      description: 'Lekkere mcdonalds burger hmmm',
      metadata: {},
    },
  },
  primary: {
    id: 'player__1001',
    size: 25,
  },
  secondary: {
    id: 'stash__1abc123',
    size: 15,
    // shopItems: [
    //   {
    //     size: { x: 2, y: 3 },
    //     name: 'phone',
    //     label: 'Telefoon',
    //     image: 'phone.png',
    //     amount: 10,
    //     requirements: {
    //       items: [{ name: 'material_aluminum', label: 'Aluminium', amount: 2 }],
    //     },
    //   },
    //   {
    //     size: { x: 1, y: 1 },
    //     name: 'burger',
    //     label: 'Burger',
    //     image: 'burger.png',
    //     amount: 5,
    //     requirements: {
    //       items: [
    //         { name: 'microwave', label: 'Microwave', amount: 1 },
    //         { name: 'burger', label: 'Burger', amount: 2 },
    //       ],
    //     },
    //   },
    // ],
  },
};

devData.laptopGang = {
  name: 'banggang',
  label: 'BANGGANG 1122333',
  members: [
    { name: 'Jan Janssens', cid: 1009, hasPerms: true, isOwner: true, isPlayer: false },
    { name: 'Peter Peeters', cid: 1, hasPerms: false, isOwner: false, isPlayer: false },
    { name: 'Ian Vermeersch', cid: 1000, hasPerms: true, isOwner: false, isPlayer: true },
    { name: 'Robbe Bobbe', cid: 3, hasPerms: true, isOwner: false, isPlayer: false },
    { name: 'Dikke Mongool', cid: 4, hasPerms: false, isOwner: false, isPlayer: false },
    { name: 'Lelijke Raren', cid: 5, hasPerms: false, isOwner: false, isPlayer: false },
    { name: 'Monkey Monk', cid: 6, hasPerms: true, isOwner: false, isPlayer: false },
    { name: 'Joheoe Naam', cid: 7, hasPerms: false, isOwner: false, isPlayer: false },
    { name: 'Bedenken Hallo', cid: 8, hasPerms: true, isOwner: false, isPlayer: false },
    { name: 'Moeilijk Help', cid: 9, hasPerms: true, isOwner: false, isPlayer: false },
    { name: 'Inspiratie Loos', cid: 10, hasPerms: false, isOwner: false, isPlayer: false },
  ],
  feedMessages: [
    {
      id: 1,
      title: 'Extra lange en leuke titel joehoeee!!!',
      content:
        'orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
      date: 1686087355428,
    },
    {
      id: 2,
      title: 'lange en leuke titel',
      content:
        'orem Ipsum is simply dummy text of the printing and typesetting indust o make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was p',
      date: 1686087355427,
    },
    {
      id: 3,
      title: 'short title',
      content: 'Zeer kort bericht',
      date: 1686087355426,
    },
    {
      id: 4,
      title: 'Extra lange 2',
      content:
        'orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
      date: 1686087355425,
    },
    {
      id: 5,
      title: 'Extra lange 3',
      content:
        'orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
      date: 1686087355424,
    },
  ],
};

devData.laptopGangExtraFeedMessages = [
  {
    id: 3,
    title: 'Nieuwe ziekte',
    content: 'er is een nieuwe ziekte gevonden whooohooo',
    date: 1686087355420,
  },
];

devData.idListInfo = {
  current: [
    {
      source: 1,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 2,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 1,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 2,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 1,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 2,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 1,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 2,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 1,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 2,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 1,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 2,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
    {
      source: 3,
      steamId: 'steam:suckdeesnuts',
    },
  ],
  recent: [
    {
      source: 892,
      steamId: 'steam:10bytelength',
    },
  ],
};

devData.phoneInfoApp = [
  {
    name: 'id',
    value: 183,
    icon: 'id-card',
    prefix: '#',
  },
  {
    name: 'phone',
    value: '0467227521',
    icon: 'hashtag',
    prefix: '',
  },
  {
    name: 'cash',
    value: 1672,
    icon: 'wallet',
    prefix: '€',
    color: '#81c784',
  },
  {
    name: 'bank',
    value: 12783790,
    icon: 'piggy-bank',
    prefix: '€',
    color: '#64b5f6',
  },
] satisfies Phone.Info.InfoAppEntry[];

devData.phoneCalls = [
  {
    name: 'JEEE',
    number: 469,
    date: 69,
    incoming: true,
  },
];

devData.reports = [
  {
    id: 1,
    createdAt: '2022-09-29T12:17:47.197+02:00',
    updatedAt: '2022-09-29T12:17:47.197+02:00',
    deletedAt: null,
    title: 'First cringe RP report',
    creator: 'NuttyShrimp1',
    open: true,
    tags: [{ name: 'bug-report', color: 'red' }],
    members: [
      { name: 'NuttyShrimp', steamId: 'steam:110000137164c7d' },
      { name: 'Jens', steamId: 'steam:11000011bf78d6c' },
    ],
    messages: null,
  },
  {
    id: 2,
    createdAt: '2022-09-29T12:17:47.197+02:00',
    updatedAt: '2022-09-29T12:17:47.197+02:00',
    deletedAt: null,
    title:
      'Zeer groot probleem wollah ik plaats heel het probleem in de title want ben een grote b-type die niet kan lezen',
    creator: 'NuttyShrimp1',
    open: true,
    tags: [],
    members: [
      { name: 'NuttyShrimp', steamId: 'steam:110000137164c7d' },
      { name: 'Jens', steamId: 'steam:11000011bf78d6c' },
    ],
    messages: null,
  },
];

devData.reportMessages = [
  {
    id: 10,
    createdAt: '2023-01-13T00:15:30.358+01:00',
    updatedAt: '2023-01-13T00:15:30.358+01:00',
    deletedAt: null,
    message:
      '{"content":[{"attrs":{"level":1},"content":[{"marks":[{"type":"bold"}],"text":"COCKa","type":"text"}],"type":"heading"},{"content":[{"text":"This a fat message :)","type":"text"}],"type":"paragraph"}],"type":"doc"}',
    type: 'text',
    sender: {
      username: 'NuttyShrimp1',
      avatarUrl: 'https://cdn.discordapp.com/avatars/214294598766297088/f2b9fae369a33df91702ea5079e3f55d',
      roles: ['developer'],
      steamId: 'steam:110000137164c7',
    },
  },
];

devData.realEstateProperties = [
  {
    name: 'San Andreas Drive 1',
    locked: false,
    owned: true,
    accessList: [
      {
        cid: 1001,
        name: 'Dev Looper',
      },
      {
        cid: 1002,
        name: 'Benny Van Der Meers with a way to long name omega lul',
      },
      {
        cid: 1003,
        name: 'Benny Van Der Meers',
      },
      {
        cid: 1004,
        name: 'Benny Van Der Meers',
      },
      {
        cid: 1005,
        name: 'Benny Van Der Meers',
      },
      {
        cid: 1006,
        name: 'Benny Van Der Meers',
      },
      {
        cid: 1007,
        name: 'Benny Van Der Meers',
      },
      {
        cid: 1008,
        name: 'Benny Van Der Meers',
      },
      {
        cid: 1009,
        name: 'Benny Van Der Meers',
      },
      {
        cid: 1010,
        name: 'Benny Van Der Meers',
      },
    ],
    flags: {
      garage: true,
      locations: true,
    },
    metadata: {
      maxKeys: 5,
    },
  },
  {
    name: 'Houston Crossing 15',
    locked: false,
    accessList: [],
    // Adding some data that should not be available but we magically got it
    flags: {
      garage: true,
    },
  },
  {
    name: 'Rodeo Drive 1',
    locked: false,
    owned: true,
    accessList: [
      {
        cid: 1001,
        name: 'Dev Looper',
      },
      {
        cid: 1002,
        name: 'Benny Van Der Meers',
      },
    ],
    flags: {
      garage: false,
      locations: true,
    },
    metadata: {
      maxKeys: 5,
    },
  },
] as Phone.RealEstate.Property[];

devData.carboosting = {
  signedUp: true,
  reputation: {
    percentage: 50,
    currentClass: 'C',
    nextClass: 'B',
  },
  contracts: [
    {
      id: 1,
      class: 'A',
      brand: 'BMW',
      name: 'M4 Competition',
      expirationTime: 1691766386853,
      disabledActions: {
        boost: false,
        scratch: false,
        decline: false,
      },
      price: {
        boost: 0,
        scratch: 10,
      },
    },
    {
      id: 2,
      class: 'X',
      brand: 'Mclaren',
      name: '720s',
      expirationTime: 1691766697190,
      disabledActions: {
        boost: false,
        scratch: false,
        decline: true,
      },
      price: {
        boost: 20,
        scratch: 40,
      },
    },
    {
      id: 3,
      class: 'D',
      brand: 'Lumbergumber',
      name: 'Aventador',
      expirationTime: 1691766697190,
      disabledActions: {
        boost: false,
        scratch: true,
        decline: false,
      },
      price: {
        boost: 20,
        scratch: 40,
      },
    },
    {
      id: 4,
      class: 'C',
      brand: 'Volvo',
      name: 'V90 Liberty Walk Widebody Tuned Insane Stancing Politie',
      expirationTime: 1691766697190,
      disabledActions: {
        boost: false,
        scratch: true,
        decline: false,
      },
      price: {
        boost: 20,
        scratch: 40,
      },
    },
    {
      id: 5,
      class: 'B',
      brand: 'Audi',
      name: 'RS6',
      expirationTime: 1691766697190,
      disabledActions: {
        boost: true,
        scratch: false,
        decline: false,
      },
      price: {
        boost: 20,
        scratch: 40,
      },
    },
    {
      id: 6,
      class: 'A+',
      brand: 'Ocelot',
      name: 'Jugular',
      expirationTime: 1691766697190,
      disabledActions: {
        boost: true,
        scratch: false,
        decline: false,
      },
      price: {
        boost: 20,
        scratch: 40,
      },
    },
  ],
} satisfies Laptop.Carboosting.State;
