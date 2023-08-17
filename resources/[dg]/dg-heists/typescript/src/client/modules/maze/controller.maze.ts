import { Peek, Police } from '@dgx/client';
import { startPanelHack } from './service.maze';

Peek.addFlagEntry('mazeHackPanel', {
  options: [
    {
      label: 'Hack',
      icon: 'fas fa-usb-drive',
      action: (_, entity) => {
        if (!entity) return;
        startPanelHack(entity);
      },
      canInteract: () => {
        return Police.canDoActivity('heist_maze');
      },
    },
  ],
});
