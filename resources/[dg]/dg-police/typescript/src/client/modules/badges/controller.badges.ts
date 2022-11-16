import { Events, PropAttach, UI, Util } from '@dgx/client';

Events.onNet('police:badges:doAnimation', async () => {
  const ped = PlayerPedId();
  ClearPedSecondaryTask(ped);
  await Util.loadAnimDict('missfbi_s4mop');
  TaskPlayAnim(ped, 'missfbi_s4mop', 'swipe_card', 1.0, 1.0, -1, 50, 0, false, false, false);
  await Util.Delay(800);
  const badgePropId = await PropAttach.add('badge');
  await Util.Delay(2500);
  ClearPedSecondaryTask(ped);
  PropAttach.remove(badgePropId);
});

Events.onNet('police:badges:openUI', (type: BadgeType, name: string) => {
  UI.openApplication('badge', {
    type,
    name,
  });
  setTimeout(() => {
    UI.closeApplication('badge');
  }, 5000);
});
