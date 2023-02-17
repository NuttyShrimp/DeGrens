import { RPC } from '@dgx/client';

export const ambulance: RadialMenu.Entry[] = [
  {
    title: 'Job Allowlist',
    icon: 'users-gear',
    type: 'dgxServer',
    event: 'jobs:whitelist:server:openJobAllowlist',
    shouldClose: true,
    isEnabled: async () => {
      const hasAccess = await RPC.execute<boolean>('jobs:server:hasSpeciality', 'HC');
      return hasAccess ?? false;
    },
  },
  {
    title: 'Check Status',
    icon: 'monitor-waveform',
    type: 'dgxServer',
    event: 'hospital:job:checkStatus',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: ({ currentVehicle }) => !currentVehicle,
  },
  {
    title: 'Verzorgen',
    icon: 'kit-medical',
    type: 'dgxServer',
    event: 'hospital:job:heal',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: ({ currentVehicle }) => !currentVehicle,
  },
  {
    title: 'Politie Assistentie',
    icon: 'light-emergency',
    type: 'client',
    event: 'hospital:assistence',
    shouldClose: true,
  },
  {
    title: 'Open ANG',
    icon: 'tablet',
    type: 'client',
    event: 'hospital:openAng',
    shouldClose: true,
  },
];
