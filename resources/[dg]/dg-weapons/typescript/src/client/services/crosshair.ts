import { Util } from '@dgx/client';

let shouldShowCrosshair = true;
let crosshairEnabled = false;
let nativeCrosshairEnabled = false;

export const isCrosshairEnabled = () => crosshairEnabled;

export const setCrosshairEnabled = (enabled: boolean, useNative = false, ignoreConfig = false) => {
  if (crosshairEnabled === enabled) return;

  crosshairEnabled = enabled;

  if (crosshairEnabled && useNative) {
    global.exports['dg-misc'].setDefaultReticleEnabled(true);
    nativeCrosshairEnabled = true;
  } else {
    if (nativeCrosshairEnabled) {
      global.exports['dg-misc'].setDefaultReticleEnabled(false);
      nativeCrosshairEnabled = false;
    }

    if (crosshairEnabled && (shouldShowCrosshair || ignoreConfig)) {
      showCrosshair(true);
    } else {
      showCrosshair(false);
    }
  }
};

const showCrosshair = (show: boolean) => {
  SendNUIMessage({
    action: 'showReticle',
    show,
  });
};

Util.onPreferenceChange<{ hud: { crosshair: boolean } }>(preferences => {
  shouldShowCrosshair = preferences?.hud?.crosshair ?? true;
});

global.exports('setCrosshairEnabled', setCrosshairEnabled);
