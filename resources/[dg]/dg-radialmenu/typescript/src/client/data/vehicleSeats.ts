// We do not check if these seats exist because the order of entries would be fucked
export const vehicleSeats: RadialMenu.Entry[] = [
  {
    title: 'Bijrijder',
    icon: '2',
    type: 'client',
    event: 'vehicles:radial:seat',
    data: {
      seatId: 0,
    },
  },
  {
    title: 'Rechts Achter',
    icon: '4',
    type: 'client',
    event: 'vehicles:radial:seat',
    data: {
      seatId: 2,
    },
  },
  {
    title: 'Links Achter',
    icon: '3',
    type: 'client',
    event: 'vehicles:radial:seat',
    data: {
      seatId: 1,
    },
  },
  {
    title: 'Bestuurder',
    icon: '1',
    type: 'client',
    event: 'vehicles:radial:seat',
    data: {
      seatId: -1,
    },
  },
];
