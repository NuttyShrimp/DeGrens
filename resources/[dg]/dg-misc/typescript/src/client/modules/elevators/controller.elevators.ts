import { Events, Peek, UI } from '@dgx/client';
import { goToLevel, loadElevators, openElevatorMenu } from './service.elevators';

Peek.addZoneEntry('elevator', {
  options: [
    {
      icon: 'fas fa-circle-sort',
      label: 'Gebruik Lift',
      action: option => {
        openElevatorMenu(option.data.elevatorId, option.data.levelId);
      },
    },
  ],
  distance: 2.0,
});

UI.RegisterUICallback('elevator/goToLevel', (data: { elevatorId: string; levelId: string }, cb) => {
  goToLevel(data.elevatorId, data.levelId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

Events.onNet('misc:elevators:load', loadElevators);
