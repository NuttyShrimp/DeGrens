import { Events, Interiors, Inventory, Notifications, Peek, RPC, Util } from '@dgx/client';

Peek.addZoneEntry('materials_mold_melting', {
  options: [
    {
      label: 'Mal Vullen',
      icon: 'fas fa-fill',
      items: 'key_mold',
      action: () => {
        Events.emitNet('materials:containers:meltMold');
      },
    },
  ],
  distance: 3.0,
});

on('materials:containers:leave', async () => {
  DoScreenFadeOut(500);
  await Util.Delay(500);
  Interiors.exitRoom();
  await Util.Delay(500);
  DoScreenFadeIn(500);
  Events.emitNet('materials:containers:left');
});

on('materials:containers:open', async () => {
  const benchName = await RPC.execute<string | undefined>('materials:containers:getBenchName');
  if (!benchName) {
    Notifications.add('Er is iets foutgelopen', 'error');
    return;
  }
  Inventory.openBench(benchName);
});
