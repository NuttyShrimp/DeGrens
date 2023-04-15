import { Events, Notifications, Util } from '@dgx/client';

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
