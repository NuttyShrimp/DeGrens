import { Police, RPC } from '@dgx/client';

export const police: RadialMenu.Entry[] = [
  {
    title: 'Job Allowlist',
    icon: 'users-gear',
    type: 'client',
    event: 'jobs:client:openJobAllowlist',
    shouldClose: true,
    isEnabled: async () => {
      const hasAccess = await RPC.execute<boolean>('jobs:whitelist:hasWhitelistAccess');
      return hasAccess ?? false;
    },
  },
  {
    title: 'Toon Badge',
    icon: 'id-badge',
    type: 'dgxServer',
    event: 'police:badges:showPoliceBadge',
  },
  {
    title: 'Open Locker',
    icon: 'box-archive',
    type: 'client',
    event: 'police:openLocker',
    shouldClose: true,
    isEnabled: () => Police.isAtLocker(),
  },
  {
    title: 'Cash Afnemen',
    icon: 'money-bill',
    type: 'dgxServer',
    event: 'police:interactions:seizeCash',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: ({ currentVehicle }) => !currentVehicle,
  },
  {
    title: 'Fouilleren',
    icon: 'magnifying-glass',
    type: 'dgxServer',
    event: 'police:interactions:search',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: ({ currentVehicle }) => !currentVehicle,
  },
  {
    title: 'Aftasten',
    icon: 'hand',
    type: 'dgxServer',
    event: 'police:interactions:patDown',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: ({ currentVehicle }) => !currentVehicle,
  },
  {
    title: 'Cuff Logs',
    icon: 'calendar-lines',
    type: 'dgxServer',
    event: 'police:interactions:showCuffLogs',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: ({ currentVehicle }) => !currentVehicle,
  },
  {
    title: 'Open Storage',
    icon: 'treasure-chest',
    type: 'client',
    event: 'police:carStorage',
    shouldClose: true,
    isEnabled: ({ currentVehicle }) => {
      return !!currentVehicle;
    },
  },
  {
    title: 'Confisqueren',
    icon: 'box-circle-check',
    type: 'dgxServer',
    event: 'police:prison:confiscate',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: ({ currentVehicle }) => !currentVehicle,
  },
  {
    title: 'GSR Test',
    icon: 'thermometer',
    type: 'dgxServer',
    event: 'police:checkGSR',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: ({ currentVehicle }) => !currentVehicle,
  },
  {
    title: 'Check Status',
    icon: 'monitor-waveform',
    type: 'dgxServer',
    event: 'police:checkStatus',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: ({ currentVehicle }) => !currentVehicle,
  },
];
