import { Events, Notifications, PropAttach, Util } from '@dgx/client';

let charObj = 0;

Events.onNet('misc:binoculars:use', async () => {
  if (Util.isFirstPersonCamEnabled()) {
    Notifications.add('Momenteel niet beschikbaar', 'error');
    return;
  }

  Util.startScenarioInPlace('WORLD_HUMAN_BINOCULARS');

  await Util.Delay(1500);

  const fpCamPromise = Util.startFirstPersonCam();

  const scaleform = RequestScaleformMovie('BINOCULARS');
  await Util.awaitCondition(() => HasScaleformMovieLoaded(scaleform));

  PushScaleformMovieFunction(scaleform, 'SET_CAM_LOGO');
  PushScaleformMovieFunctionParameterInt(0);
  PopScaleformMovieFunctionVoid();

  const drawInterval = setInterval(() => {
    DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0);
  }, 1);

  await fpCamPromise;

  clearInterval(drawInterval);
  SetScaleformMovieAsNoLongerNeeded(scaleform);
  const ped = PlayerPedId();
  ClearPedTasks(ped);
});

Events.onNet('misc:lawnchair:use', async () => {
  const ped = PlayerPedId();
  if (IsPedInAnyVehicle(ped, false)) {
    Notifications.add('Je kan dit niet doen in een voertuig', 'error');
    return;
  }

  if (charObj) {
    ClearPedTasks(ped);
    PropAttach.remove(charObj);
    charObj = 0;
    return;
  }

  // Other good animation is timetable@ron@ig_crouch_3 base

  charObj = PropAttach.add('lawn_chair');
  await Util.loadAnimDict('timetable@reunited@ig_10');
  TaskPlayAnim(ped, 'timetable@reunited@ig_10', 'base_amanda', 8.0, 8.0, -1, 1, 0, false, false, false);
  setTimeout(() => {
    const checkInterval = setInterval(() => {
      if (!IsEntityPlayingAnim(ped, 'timetable@reunited@ig_10', 'base_amanda', 1) || !charObj) {
        clearInterval(checkInterval);
        if (charObj) {
          PropAttach.remove(charObj);
          charObj = 0;
        }
      }
    }, 250);
  }, 1000);
});
