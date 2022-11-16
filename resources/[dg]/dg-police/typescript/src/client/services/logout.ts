import { PolyZone, Keys, Jobs, UI, Events } from '@dgx/client';

let inPoliceLogoutZone = false;

PolyZone.addBoxZone('police_logout', { x: 479.0076, y: -983.504, z: 30.7444 }, 1, 1, {
  heading: 174.8459,
  minZ: 28.7444,
  maxZ: 32.7444,
  data: {},
});

PolyZone.onEnter('police_logout', () => {
  if (Jobs.getCurrentJob().name !== 'police') return;
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Logout`);
  inPoliceLogoutZone = true;
});

PolyZone.onLeave('police_logout', () => {
  UI.hideInteraction();
  inPoliceLogoutZone = false;
});

Keys.onPressDown('GeneralUse', () => {
  if (!inPoliceLogoutZone) return;
  DoScreenFadeOut(500);
  setTimeout(() => {
    Events.emitNet('chars:server:logOut');
  }, 500);
});
