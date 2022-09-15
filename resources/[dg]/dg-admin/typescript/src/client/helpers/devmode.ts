let devModeEnabled = false;

export const isDevModeEnabled = () => devModeEnabled;

export const setDevModeEnabled = (toggle: boolean) => {
  devModeEnabled = toggle;
};

onNet('dgx:isProduction', (isProd: boolean) => {
  devModeEnabled = !isProd;
  if (isProd) return;
  SendNUIMessage({
    action: 'overwriteDevmode',
    data: !isProd,
  });
});
