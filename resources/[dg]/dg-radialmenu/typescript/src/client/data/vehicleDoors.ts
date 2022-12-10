// We do not check if these doors exist because the order of entries would be fucked
export const vehicleDoors: RadialMenu.Entry[] = [
  {
    title: 'Bestuurder',
    icon: '1',
    type: 'client',
    event: 'vehicles:radial:door',
    data: {
      doorId: 0,
    },
  },
  {
    title: 'Motorkap',
    icon: 'car',
    type: 'client',
    event: 'vehicles:radial:door',
    data: {
      doorId: 4,
    },
  },
  {
    title: 'Bijrijder',
    icon: '2',
    type: 'client',
    event: 'vehicles:radial:door',
    data: {
      doorId: 1,
    },
  },
  {
    title: 'Rechts Achter',
    icon: '4',
    type: 'client',
    event: 'vehicles:radial:door',
    data: {
      doorId: 3,
    },
  },
  {
    title: 'Kofferbak',
    icon: 'car',
    type: 'client',
    event: 'vehicles:radial:door',
    data: {
      doorId: 5,
    },
  },
  {
    title: 'Links Achter',
    icon: '3',
    type: 'client',
    event: 'vehicles:radial:door',
    data: {
      doorId: 2,
    },
  },
];
