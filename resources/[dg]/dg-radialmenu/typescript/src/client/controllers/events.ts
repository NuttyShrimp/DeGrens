import { UI } from '@dgx/client';
import { handleRadialMenuClose } from 'services/radialmenu';

UI.onUIReload(() => {
  handleRadialMenuClose();
  SendNUIMessage({
    reload: true,
  });
});
