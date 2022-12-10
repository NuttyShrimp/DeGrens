import { Peek } from '@dgx/client';
import { tryToCutWire } from './service.wirecutting';

Peek.addZoneEntry('wirecutting', {
  options: [
    {
      label: 'Knip',
      icon: 'fas fa-scissors',
      action: option => {
        tryToCutWire(option.data.id);
      },
    },
  ],
  distance: 3.0,
});
