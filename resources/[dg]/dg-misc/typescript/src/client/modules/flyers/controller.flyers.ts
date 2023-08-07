import { Events, PropAttach, UI, Util } from '@dgx/client';

let uiTimeout: NodeJS.Timeout | null = null;

UI.RegisterUICallback('misc/flyers/create', (data: { id: number }, cb) => {
  Events.emitNet('misc:flyers:createItem', data.id);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

Events.onNet('misc:flyers:showFlyer', (flyer: Flyers.UIFlyer) => {
  UI.openApplication('flyer', flyer);
  if (uiTimeout) {
    clearTimeout(uiTimeout);
  }
  uiTimeout = setTimeout(() => {
    UI.closeApplication('flyer');
    uiTimeout = null;
  }, 5000);
});

Events.onNet('misc:flyers:animation', async () => {
  const ped = PlayerPedId();
  ClearPedSecondaryTask(ped);
  await Util.loadAnimDict('missfbi_s4mop');
  TaskPlayAnim(ped, 'missfbi_s4mop', 'swipe_card', 1.0, 1.0, -1, 50, 0, false, false, false);
  await Util.Delay(800);
  const badgePropId = PropAttach.add('badge');
  await Util.Delay(2500);
  ClearPedSecondaryTask(ped);
  PropAttach.remove(badgePropId);
});
