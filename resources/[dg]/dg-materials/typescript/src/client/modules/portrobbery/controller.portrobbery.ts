import { Events, Peek } from '@dgx/client';
import {
  buildPortrobberyLocationZone,
  destroyPortrobberyLocationZone,
  openPortrobberyCam,
  startLootingPortrobberyLocation,
} from './service.portrobbery';

Peek.addFlagEntry('isPortrobberyCodePed', {
  options: [
    {
      label: 'Code Vragen',
      icon: 'fas fa-question-circle',
      action: (_, entity) => {
        if (!entity || !DoesEntityExist(entity)) return;
        const codePedIdx = Entity(entity).state.portrobberyCodePedIdx;
        if (codePedIdx == undefined) return;
        Events.emitNet('materials:portrobbery:requestCode', codePedIdx);
      },
    },
  ],
});

Peek.addZoneEntry('portrobberyCodeInputZone', {
  options: [
    {
      label: 'Code Invoeren',
      icon: 'fas fa-keyboard',
      action: () => {
        Events.emitNet('materials:portrobbery:inputCode');
      },
    },
  ],
});

Peek.addZoneEntry('portrobberyLocation', {
  options: [
    {
      label: 'Openen',
      icon: 'fas fa-wrench',
      items: 'angle_grinder',
      action: option => {
        const locationIdx = option.data.locationIdx;
        if (locationIdx == undefined) return;
        startLootingPortrobberyLocation(locationIdx);
      },
    },
  ],
});

Events.onNet('materials:portrobbery:buildLocationZone', buildPortrobberyLocationZone);
Events.onNet('materials:portrobbery:destroyLocationZone', destroyPortrobberyLocationZone);
Events.onNet('materials:portrobbery:openCam', openPortrobberyCam);
