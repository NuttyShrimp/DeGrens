import { devData } from '@src/lib/devdata';

import { defaultState } from '../../lib/defaultState';

export const cmds: {
  cmd: string;
  app: string;
  show?: boolean;
  hide?: boolean;
  data?: Record<string, any> | (() => Record<string, any>);
}[] = [
  {
    cmd: 'show debuglogs',
    app: 'debuglogs',
    show: true,
  },
  {
    cmd: 'hide debuglogs',
    app: 'debuglogs',
    show: false,
  },
  {
    cmd: 'interaction $1 $2',
    app: 'interaction',
    show: true,
    data: {
      text: '$2',
      type: '$1',
    },
  },
  {
    cmd: 'hide interaction',
    app: 'interaction',
    show: false,
    data: {},
  },
  {
    cmd: 'notification $1 $2',
    app: 'notifications',
    data: {
      action: 'add',
      notification: {
        message: '$1',
        type: '$2',
      },
    },
  },
  {
    cmd: 'persi-notification $1 $2',
    app: 'notifications',
    data: {
      action: 'add',
      notification: {
        message: '$1',
        type: '$2',
        persistent: true,
      },
    },
  },
  {
    cmd: 'show input $1',
    app: 'input',
    show: true,
    data: {
      callbackURL: 'testCB',
      header: '$1',
      inputs: [
        {
          name: 'text-1',
          type: 'text',
          label: 'Text',
        },
        {
          name: 'number-1',
          type: 'number',
          label: 'Number',
        },
        {
          name: 'password-1',
          type: 'password',
          label: 'Password',
        },
        {
          name: 'select-1',
          type: 'select',
          label: 'Select',
          options: [
            {
              label: 'Option-1',
              value: 'option-1',
            },
            {
              label: 'Option-2',
              value: 'option-2',
            },
            {
              label: 'Option-3',
              value: 'option-3',
            },
          ],
        },
      ],
    },
  },
  {
    cmd: 'show hud',
    app: 'hud',
    show: true,
    data: defaultState.hud,
  },
  {
    cmd: 'hide hud',
    app: 'hud',
    show: false,
    data: {},
  },
  {
    cmd: 'show speedometer',
    app: 'hud',
    data: {
      action: 'setCarValues',
      data: {
        visible: true,
        speed: 100,
        fuel: 75,
        indicator: {
          belt: true,
          engine: true,
          service: true,
        },
      },
    },
  },
  {
    cmd: 'show compass',
    app: 'hud',
    data: {
      action: 'setCompassValues',
      data: {
        visible: true,
        heading: 100,
        street1: 'ON GOD STREET',
        street2: 'HIGH WAY TO HELL',
        area: 'BOZO AREA',
      },
    },
  },
  {
    cmd: 'show cash-hud',
    app: 'hud',
    data: {
      action: 'addCashHistory',
      data: 34745,
      amount: -100,
    },
  },
  {
    cmd: 'show contextmenu',
    app: 'contextmenu',
    show: true,
    data: defaultState.contextmenu,
  },
  {
    cmd: 'hide contextmenu',
    app: 'contextmenu',
    show: false,
  },
  {
    cmd: 'show phone',
    app: 'phone',
    show: true,
    data: {},
  },
  {
    cmd: 'hide phone',
    app: 'phone',
    show: false,
  },
  {
    cmd: 'show bank',
    app: 'financials',
    show: true,
    data: defaultState.financials,
  },
  {
    cmd: 'hide bank',
    app: 'financials',
    show: false,
  },
  {
    cmd: 'show scenes',
    app: 'scenes',
    show: true,
    data: {},
  },
  {
    cmd: 'hide scenes',
    app: 'scenes',
    show: false,
  },
  {
    cmd: 'show sliders',
    app: 'sliders',
    show: true,
    data: {},
  },
  {
    cmd: 'hide sliders',
    app: 'sliders',
    show: false,
  },
  {
    cmd: 'show taskbar $1 $2 $3',
    app: 'taskbar',
    show: true,
    data: {
      icon: '$1',
      label: '$2',
      duration: '$3',
      id: 'cmd-dev',
    },
  },
  {
    cmd: 'hide taskbar',
    app: 'taskbar',
    show: false,
  },
  {
    cmd: 'show peek',
    app: 'peek',
    show: true,
    data: {},
  },
  {
    cmd: 'hide peek',
    app: 'peek',
    show: false,
  },
  {
    cmd: 'show inventory',
    app: 'inventory',
    show: true,
  },
  {
    cmd: 'hide inventory',
    app: 'inventory',
    show: false,
  },
  {
    cmd: 'inventory update',
    app: 'inventory',
    data: {
      id: 'microwave_000002',
      inventory: 'player__1001',
      position: { x: 1, y: 2 },
      size: { x: 4, y: 1 },
      name: 'microwave',
      label: 'test',
      quality: 69,
      image: 'weapon_nightstick.png',
      description: 'Een apparaat om je identiteit geheim te houden terwijl je verbonden bent met een netwerk!',
      useable: true,
      closeOnUse: false,
      markedForSeizure: true,
      metadata: {},
    },
  },
  {
    cmd: 'itembox $1 $2',
    app: 'itemboxes',
    data: {
      action: '$1',
      image: '$2',
    },
  },
  {
    cmd: 'show bennys',
    app: 'bennys',
    show: true,
    data: {
      options: devData.bennysCategories,
    },
  },
  {
    cmd: 'show repair bennys',
    app: 'bennys',
    show: true,
    data: {
      repairCost: 1000,
      options: devData.bennysCategories,
    },
  },
  {
    cmd: 'hide bennys',
    app: 'bennys',
    show: false,
  },
  {
    cmd: 'bennys send dir key $1',
    app: 'bennys',
    data: {
      action: 'sendDirection',
      direction: '$1',
    },
  },
  {
    cmd: 'show laptop',
    app: 'laptop',
    show: true,
  },
  {
    cmd: 'hide laptop',
    app: 'laptop',
    show: false,
  },
  {
    cmd: 'show radio',
    app: 'radio',
    show: true,
    data: {
      frequency: 49.52,
      enabled: false,
    },
  },
  {
    cmd: 'hide radio',
    app: 'radio',
    show: false,
  },
  {
    cmd: 'show configmenu',
    app: 'configmenu',
    show: true,
  },
  {
    cmd: 'hide configmenu',
    app: 'configmenu',
    show: false,
  },
  {
    cmd: 'keygame',
    app: 'keygame',
    show: true,
    data: {
      id: 1,
      keys: {
        W: 'up',
        S: 'down',
        A: 'left',
        D: 'right',
      },
      cycles: [
        {
          speed: 4,
          size: 30,
        },
        {
          speed: 10,
          size: 20,
        },
        {
          speed: 10,
          size: 40,
        },
      ],
    },
  },
  {
    cmd: 'show gridgame',
    app: 'gridgame',
    show: true,
    data: defaultState.gridgame.sequence,
  },
  {
    cmd: 'hide gridgame',
    app: 'gridgame',
    show: false,
  },
  {
    cmd: 'phone notification',
    app: 'phone',
    data: () => ({
      appName: 'pinger',
      action: 'doRequest',
      data: { id: Math.floor(Math.random() * 100), origin: 3 },
    }),
  },
  {
    cmd: 'show dispatch',
    app: 'dispatch',
    show: true,
  },
  {
    cmd: 'hide dispatch',
    app: 'dispatch',
    show: false,
  },
  {
    cmd: 'show policeradar',
    app: 'policeradar',
    show: true,
  },
  {
    cmd: 'hide policeradar',
    app: 'policeradar',
    show: false,
  },
  {
    cmd: 'policeradar update',
    app: 'policeradar',
    data: {
      currentSpeed: 4,
      topSpeed: 20,
      plate: 'JENSKKR1',
      flagged: true,
    },
  },
  {
    cmd: 'show badge',
    app: 'badge',
    show: true,
    data: {
      type: 'police',
      name: 'Dev Loper',
    },
  },
  {
    cmd: 'hide badge',
    app: 'badge',
    show: false,
  },
  {
    cmd: 'show idlist',
    app: 'idlist',
    show: true,
    data: {
      info: devData.idListInfo,
    },
  },
  {
    cmd: 'hide idlist',
    app: 'idlist',
    show: false,
  },
  {
    cmd: 'move idlist $1',
    app: 'idlist',
    data: {
      direction: '$1',
    },
  },
  {
    cmd: 'phone add notification',
    app: 'phone',
    data: () => ({
      appName: 'home-screen',
      action: 'addNotification',
      data: {
        id: 'test_notif',
        title: `bar`,
        description: 'foo',
        sticky: true,
        keepOnAction: true,
        icon: 'jobcenter',
      },
    }),
  },
  {
    cmd: 'phone update notification',
    app: 'phone',
    data: () => ({
      appName: 'home-screen',
      action: 'updateNotification',
      data: {
        id: 'test_notif',
        notification: {
          title: 'ziektes',
        },
      },
    }),
  },
  {
    cmd: 'phone remove notification',
    app: 'phone',
    data: () => ({
      appName: 'home-screen',
      action: 'removeNotification',
      data: 'test_notif',
    }),
  },
  {
    cmd: 'show reports',
    app: 'reports',
    show: true,
  },
  {
    cmd: 'hide reports',
    app: 'reports',
    show: false,
  },
];