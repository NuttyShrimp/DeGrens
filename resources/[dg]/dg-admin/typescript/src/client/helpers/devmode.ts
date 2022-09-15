import { HUD } from '@dgx/client';

let devModeEnabled = false;

export const isDevModeEnabled = () => devModeEnabled;

export const setDevModeEnabled = (toggle: boolean) => {
  devModeEnabled = toggle;
  HUD.toggleEntry('dev-mode', toggle);
};

onNet('dgx:isProduction', (isProd: boolean) => {
  devModeEnabled = !isProd;
  if (isProd) return;
  HUD.toggleEntry('dev-mode', !isProd);
  SendNUIMessage({
    action: 'overwriteDevmode',
    data: !isProd,
  });
});
