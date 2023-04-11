import { Events, Notifications, PropAttach, Util } from '@dgx/client';

const ANIM = {
  dict: 'amb@world_human_paparazzi@male@base',
  name: 'base',
};

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
  const fpCamPromise = Util.startFirstPersonCam();

  SetTimecycleModifier('scanline_cam_cheap');
  SetTimecycleModifierStrength(1.5);

  await fpCamPromise;

  ClearTimecycleModifier();
  PropAttach.remove(propId);
  StopAnimTask(ped, ANIM.dict, ANIM.name, 1.0);
});
