import { defaultState } from '../../lib/defaultState';

export const cmds: {
  cmd: string;
  app: string;
  show?: boolean;
  hide?: boolean;
  data?: Record<string, any>;
}[] = [
  {
    cmd: 'show debuglogs',
    app: 'debuglogs',
    show: true,
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
    hide: true,
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
];
