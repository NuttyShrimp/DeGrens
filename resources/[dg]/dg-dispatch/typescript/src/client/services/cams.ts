import { Animations, Events, Jobs, Notifications, UI, Util } from '@dgx/client';

let cams: Dispatch.Cams.Cam[] = [];
let cameraActive = false;

Events.onNet('dispatch:cams:set', (pCams: Dispatch.Cams.Cam[]) => {
  cams = pCams;
  seedUICams();
});

export const seedUICams = () => {
  UI.SendAppEvent('dispatch', {
    action: 'addCams',
    cams: cams.map((c, idx) => ({ label: c.label, id: idx + 1 })),
  });
};

export const openCam = async (id: number) => {
  if (Jobs.getCurrentJob().name !== 'police') return;

  const camInfo = cams[id - 1];
  if (!camInfo) {
    Notifications.add(`Camera ${id} bestaat niet`);
    return;
  }
  UI.closeApplication('dispatch');

  if (cameraActive) {
    await closeCam();
  }

  Animations.startTabletAnimation();
  await Util.enterCamera({
    coords: camInfo.coords,
    rotation: camInfo.defaultRotation,
    allowMovement: true,
    onClose: () => {
      Animations.stopTabletAnimation();
    },
  });
};

export const closeCam = async () => {
  if (!cameraActive) return;

  await Util.exitCamera(); // this will also fire the onClose cb
};
