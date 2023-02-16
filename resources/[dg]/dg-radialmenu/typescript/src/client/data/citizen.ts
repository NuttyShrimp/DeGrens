export const citizen: RadialMenu.Entry[] = [
  {
    title: 'Geef Telefoonnummer',
    icon: 'address-book',
    type: 'dgxServer',
    event: 'dg-phone:server:contacts:shareNumber',
    shouldClose: true,
    minimumPlayerDistance: 2,
    items: ['phone'],
  },
  {
    title: 'Cornersell',
    icon: 'cannabis',
    type: 'client',
    event: 'criminal:cornersell:toggle',
    shouldClose: true,
    isEnabled: ({ job }) => job.name !== 'police',
  },
  {
    title: 'Wandelstijl',
    icon: 'person-walking',
    subMenu: 'walkstyles',
  },
  {
    title: 'Expression',
    icon: 'face-smile',
    subMenu: 'expressions',
  },
];
