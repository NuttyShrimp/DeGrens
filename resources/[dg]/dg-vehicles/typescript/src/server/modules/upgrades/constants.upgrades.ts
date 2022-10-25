export const upgradeItems = {
  xenon: {
    itemName: 'xenon_lights',
    title: 'Xenon',
    menu: [
      {
        title: 'Toggle On/Off',
        icon: 'toggle-on',
        callbackURL: 'upgrades/item/toggle',
        preventCloseOnClick: true,
        data: {
          item: 'xenon',
        },
      },
      {
        title: 'Change Color',
        icon: 'palette',
        submenu: [
          {
            title: 'Default',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: -1,
            },
          },
          {
            title: 'White',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 0,
            },
          },
          {
            title: 'Blue',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 1,
            },
          },
          {
            title: 'Electric Blue',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 2,
            },
          },
          {
            title: 'Mint Green',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 3,
            },
          },
          {
            title: 'Lime Green',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 4,
            },
          },
          {
            title: 'Yellow',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 5,
            },
          },
          {
            title: 'Golden Shower',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 6,
            },
          },
          {
            title: 'Orange',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 7,
            },
          },
          {
            title: 'Red',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 8,
            },
          },
          {
            title: 'Pony Pink',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 9,
            },
          },
          {
            title: 'Hot Pink',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 10,
            },
          },
          {
            title: 'Purple',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 11,
            },
          },
          {
            title: 'Blacklight',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value: 12,
            },
          },
        ],
      },
    ],
  },
  neon: {
    itemName: 'neon_strip',
    title: 'Neon',
    menu: [
      {
        title: 'Toggle On/Off',
        icon: 'toggle-on',
        submenu: [
          {
            title: 'Left',
            callbackURL: 'upgrades/item/toggle',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              id: 0,
            },
          },
          {
            title: 'Right',
            callbackURL: 'upgrades/item/toggle',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              id: 1,
            },
          },
          {
            title: 'Front',
            callbackURL: 'upgrades/item/toggle',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              id: 2,
            },
          },
          {
            title: 'Back',
            callbackURL: 'upgrades/item/toggle',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              id: 3,
            },
          },
        ],
      },
      {
        title: 'Change Color',
        icon: 'palette',
        submenu: [
          {
            title: 'White',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 222, g: 222, b: 255 },
            },
          },
          {
            title: 'Blue',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 2, g: 21, b: 255 },
            },
          },
          {
            title: 'Electric Blue',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 3, g: 83, b: 255 },
            },
          },
          {
            title: 'Mint Green',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 0, g: 255, b: 140 },
            },
          },
          {
            title: 'Lime Green',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 94, g: 255, b: 1 },
            },
          },
          {
            title: 'Yellow',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 255, g: 255, b: 0 },
            },
          },
          {
            title: 'Golden Shower',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 255, g: 150, b: 0 },
            },
          },
          {
            title: 'Orange',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 255, g: 62, b: 0 },
            },
          },
          {
            title: 'Red',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 255, g: 1, b: 1 },
            },
          },
          {
            title: 'Pony Pink',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 255, g: 50, b: 100 },
            },
          },
          {
            title: 'Hot Pink',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 255, g: 5, b: 190 },
            },
          },
          {
            title: 'Purple',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 31, g: 1, b: 255 },
            },
          },
          {
            title: 'Blacklight',
            callbackURL: 'upgrades/item/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value: { r: 15, g: 3, b: 255 },
            },
          },
        ],
      },
    ],
  },
};

export const windowTintMenuEntries: ContextMenu.Entry[] = [
  {
    title: 'Vehicle Tint',
    icon: 'paint-roller',
  },
  {
    title: 'Level 1',
    callbackURL: 'upgrades/windowtint/set',
    preventCloseOnClick: true,
    data: {
      id: 4,
    },
  },
  {
    title: 'Level 2',
    callbackURL: 'upgrades/windowtint/set',
    preventCloseOnClick: true,
    data: {
      id: 5,
    },
  },
  {
    title: 'Level 3',
    callbackURL: 'upgrades/windowtint/set',
    preventCloseOnClick: true,
    data: {
      id: 3,
    },
  },
  {
    title: 'Level 4',
    callbackURL: 'upgrades/windowtint/set',
    preventCloseOnClick: true,
    data: {
      id: 2,
    },
  },
  {
    title: 'Level 5',
    callbackURL: 'upgrades/windowtint/set',
    preventCloseOnClick: true,
    data: {
      id: 1,
    },
  },
  {
    title: 'Apply',
    callbackURL: 'upgrades/windowtint/apply',
  },
];

export const tuneCategories: { name: keyof Upgrades.Performance; amount: number }[] = [
  { name: 'brakes', amount: 3 },
  { name: 'transmission', amount: 3 },
  { name: 'engine', amount: 4 },
  { name: 'suspension', amount: 4 },
  { name: 'turbo', amount: 1 },
];

const generateTuneItemNames = (): Record<CarClass, string[]> => {
  const carClasses: CarClass[] = ['X', 'S', 'A+', 'A', 'B', 'C', 'D'];
  const tuneItems = {} as Record<CarClass, string[]>;
  carClasses.forEach(carClass => {
    tuneItems[carClass] = tuneCategories.reduce<string[]>((acc, data) => {
      if (data.amount > 1) {
        for (let i = 1; i <= data.amount; i++) {
          acc.push(`tune_${data.name}_stage_${i}_${carClass}`);
        }
      } else {
        acc.push(`tune_${data.name}_${carClass}`);
      }
      return acc;
    }, []);
  });
  return tuneItems;
};

export const tuneItems = generateTuneItemNames();
