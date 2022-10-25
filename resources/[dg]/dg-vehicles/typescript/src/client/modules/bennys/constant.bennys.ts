export const upgradeableCategories = {
  colors: ['primaryColor', 'secondaryColor', 'pearlescentColor', 'interiorColor', 'dashboardColor', 'wheelColor'],
  interior: [
    'subwoofer',
    'trimA',
    'ornaments',
    'dial',
    'doorSpeakers',
    'seats',
    'steeringWheel',
    'shiftLever',
    'speakers',
    'trimB',
    'dashboard',
  ],
  exterior: [
    'spoiler',
    'frontBumper',
    'rearBumper',
    'sideSkirt',
    'exhaust',
    'frame',
    'grille',
    'hood',
    'leftFenders',
    'rightFenders',
    'roof',
    'horn',
    'tyreSmokeColor',
    'plateHolder',
    'plaques',
    'trunk',
    'engineHydraulics',
    'engineBlock',
    'airFilter',
    'struts',
    'archCover',
    'aerials',
    'tank',
    'door',
    'livery',
    'plateColor',
  ],
  wheels: ['wheels'],
  extras: ['extras'],
};

export const ModNameTitle: Record<keyof Upgrades.Cosmetic, string> = {
  spoiler: 'Spoiler',
  // id = 1
  frontBumper: 'Front Bumper',
  // id = 2
  rearBumper: 'Rear Bumper',
  // id = 3
  sideSkirt: 'Side Skirt',
  // id = 4
  exhaust: 'Exhaust',
  // id = 5
  frame: 'Frame',
  // id = 6
  grille: 'Grille',
  // id = 7
  hood: 'Hood',
  // id = 8
  leftFenders: 'Left Fenders',
  // id = 9
  rightFenders: 'Right Fenders',
  // id = 10
  roof: 'Roof',
  // id = 14
  horn: 'Horn',
  // id = 19
  subwoofer: 'Subwoofers',
  plateHolder: 'Plate Holder',
  vanityPlate: 'Vanity Plate',
  // id = 27
  trimA: 'Trim A',
  // id = 28
  ornaments: 'Ornaments',
  // id = 30
  dial: 'Speedometer',
  // id = 31
  doorSpeakers: 'Door Speakers',
  // id = 32
  seats: 'Seats',
  // id = 33
  steeringWheel: 'Steering Wheel',
  // id = 34
  shiftLever: 'Shift Lever',
  // id = 35
  plaques: 'Plaques',
  // id = 36
  speakers: 'Speakers',
  // id = 37
  trunk: 'Trunk',
  // id = 44
  trimB: 'Trim B',
  // id = 38
  engineHydraulics: 'Engine Hydraulics',
  // id = 39
  engineBlock: 'Engine Block',
  // id = 40
  airFilter: 'Air Filter',
  // id = 41
  struts: 'Struts',
  // id = 42
  archCover: 'Arch Cover',
  // id = 43
  aerials: 'Aerials',
  // id = 45
  tank: 'Tank',
  // id = 46
  // In core labeled as window, in native enum it is a door
  door: 'Doors',
  neon: 'Neon',
  xenon: 'Xenon',
  extras: 'Extras',
  livery: 'Liveries',
  wheels: 'Wheels',
  dashboard: 'Dashboard',
  plateColor: 'Plate Color',
  tyreSmokeColor: 'Tyre Smoke',
  primaryColor: 'Primary Color',
  secondaryColor: 'Secondary Color',
  pearlescentColor: 'Pearlescent Color',
  interiorColor: 'Interior Color',
  dashboardColor: 'Dashboard Color',
  wheelColor: 'Wheels Color',
  windowTint: 'Window Tint',
};

export const PlateColorLabels = ['Blue/White', 'Blue/White2', 'Yellow/black', 'Yellow/Blue', 'Blue/White3', 'Yankton'];

export const WheelTypeLabels = [
  // Id = 0
  'Sport',
  // Id = 1
  'Muscle',
  // Id = ...
  'Lowrider',
  'SUV',
  'Offroad',
  'Tuner',
  'Bike',
  'High End',
  "Benny's Original",
  "Benny's Bespoke",
  'Open Wheel',
  'Street',
  'Track',
];

export const TyreSmokeLabels = [
  'Standard',
  'White Tire Smoke',
  'Black Tire Smoke',
  'Blue Tire Smoke',
  'Yellow Tire Smoke',
  'Orange Tire Smoke',
  'Red Tire Smoke',
  'Green Tire Smoke',
  'Purple Tire Smoke',
  'Pink Tire Smoke',
  'Gray Tire Smoke',
];
