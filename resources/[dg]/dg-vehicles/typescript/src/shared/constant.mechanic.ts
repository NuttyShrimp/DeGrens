export const valueToLabel = {
  repair: 'Repair',
  upgrade_1: 'Stage 1 Upgrade',
  upgrade_2: 'Stage 2 Upgrade',
  upgrade_3: 'Stage 3 Upgrade',
  suspension: 'Suspension',
  engine: 'Engine',
  transmission: 'Transmission',
  brakes: 'Brakes',
  axle: 'Axle',
};

export const itemInputBase: UI.Input.Input[] = [
  {
    name: 'class',
    type: 'select',
    label: 'Vehicle Class',
    options: [
      {
        label: 'X',
        value: 'X',
      },
      {
        label: 'S',
        value: 'S',
      },
      {
        label: 'A+',
        value: 'A+',
      },
      {
        label: 'A',
        value: 'A',
      },
      {
        label: 'B',
        value: 'B',
      },
      {
        label: 'C',
        value: 'C',
      },
      {
        label: 'D',
        value: 'D',
      },
    ],
  },
  {
    name: 'amount',
    type: 'number',
    label: 'Amount',
  },
];
