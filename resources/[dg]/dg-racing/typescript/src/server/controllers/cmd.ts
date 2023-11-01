import { Events, Inventory, Overwrites, Util } from '@dgx/server';

RegisterCommand(
  'racing:enableGlobal',
  () => {
    Overwrites.setOverwrite('racing:enableGlobally', Overwrites.getOverwrite('racing:enableGlobally') || true);
    Util.getAllPlayers().forEach(async srvId => {
      const cid = Util.getCID(srvId);
      const hasDongle =
        Overwrites.getOverwrite('racing:enableGlobally') ||
        (await Inventory.doesInventoryHaveItems('player', String(cid), 'race_dongle'));
      Events.emitNet('racing:track:canSeeApp', srvId, hasDongle);
    });
  },
  true
);
