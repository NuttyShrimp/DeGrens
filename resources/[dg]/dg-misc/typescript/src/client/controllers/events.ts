import { handleArenaModuleResourceStop } from 'modules/arena/service.arena';
import { handleHudModuleResourceStop } from 'modules/hud/service.hud';
import { handleObjectManagerModuleResourceStop } from 'modules/objectManager/service.objectmanager';
import { handlePropattachModuleResourceStop } from 'modules/propattach/service.propattach';
import { handleAnimationsServiceResourceStop } from 'services/animations';

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;

  handleArenaModuleResourceStop();
  handleHudModuleResourceStop();
  handleObjectManagerModuleResourceStop();
  handlePropattachModuleResourceStop();

  handleAnimationsServiceResourceStop();
});
