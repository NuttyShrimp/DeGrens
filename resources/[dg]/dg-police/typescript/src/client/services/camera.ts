import { Events, Keys, Notifications, PropAttach, Util, UI } from '@dgx/client';

const ANIM = {
  dict: 'amb@world_human_paparazzi@male@base',
  name: 'base',
};

let canTakePicture = false;
let captureDebounce = false;

Events.onNet('police:camera:use', async () => {
  if (Util.isFirstPersonCamEnabled()) {
    Notifications.add('Momenteel niet beschikbaar', 'error');
    return;
  }

  const ped = PlayerPedId();
  await Util.loadAnimDict(ANIM.dict);
  TaskPlayAnim(ped, ANIM.dict, ANIM.name, 2.0, 2.0, -1, 17, 1, false, false, false);

  const propId = PropAttach.add('camera');

  await Util.Delay(1500);

  canTakePicture = true;
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Neem Foto`);

  const fpCamPromise = Util.startFirstPersonCam();

  SetTimecycleModifier('scanline_cam_cheap');
  SetTimecycleModifierStrength(1.5);

  await fpCamPromise;

  ClearTimecycleModifier();
  PropAttach.remove(propId);
  UI.hideInteraction();
  StopAnimTask(ped, ANIM.dict, ANIM.name, 1.0);
  canTakePicture = false;
});

Keys.onPressDown(
  'GeneralUse',
  () => {
    if (!canTakePicture) return;
    if (captureDebounce) {
      Notifications.add('Je hebt net een foto genomen', 'error');
      return;
    }

    captureDebounce = true;
    setTimeout(() => {
      captureDebounce = false;
    }, 1000);

    Notifications.add('Foto genomen (zie clipboard)', 'success');
    Events.emitNet('police:camera:takePicture');
  },
  true
);
