import { Events, HUD } from '@dgx/client';

let devModeEnabled = false;

export const isDevModeEnabled = () => devModeEnabled;

export const setDevModeEnabled = (toggle: boolean) => {
  devModeEnabled = toggle;
  HUD.toggleEntry('dev-mode', toggle);
};

onNet('dgx:isProduction', (isProd: boolean) => {
  devModeEnabled = !isProd;
  if (!devModeEnabled) return;

  Events.emitNet('admin:menu:toggleDevMode', true);
  SendNUIMessage({
    action: 'overwriteDevmode',
    data: devModeEnabled,
  });
});
