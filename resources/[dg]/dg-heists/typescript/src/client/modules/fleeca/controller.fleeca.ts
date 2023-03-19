import { Peek } from '@dgx/client';
import { checkPercentageOfLocation, disableLocationPower } from './service.fleeca';

Peek.addModelEntry('prop_elecbox_10', {
  options: [
    {
      icon: 'fas fa-calculator',
      label: 'Signaal Meten',
      items: 'volt_meter',
      action: async (_, entity) => {
        if (!entity) return;
        checkPercentageOfLocation(entity);
      },
    },
    {
      icon: 'fas fa-bolt',
      label: 'Plaats EMP',
      items: 'mini_emp',
      action: async (_, entity) => {
        if (!entity) return;
        disableLocationPower(entity);
      },
    },
  ],
  distance: 2,
});
