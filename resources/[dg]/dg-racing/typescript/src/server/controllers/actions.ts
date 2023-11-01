import { Core, Events, Inventory, Overwrites } from '@dgx/server';
import { charModule } from 'helpers/core';

Core.onPlayerLoaded(async ply => {
  const hasDongle =
    Overwrites.getOverwrite('racing:enableGlobally') ||
    (await Inventory.doesInventoryHaveItems('player', String(ply.citizenid), 'race_dongle'));
  const hasCreatorDongle = await Inventory.doesInventoryHaveItems(
    'player',
    String(ply.citizenid),
    'race_creator_dongle'
  );
  if (!ply.serverId) return;
  Events.emitNet('racing:track:canCreate', ply.serverId, hasCreatorDongle);
  Events.emitNet('racing:track:canSeeApp', ply.serverId, hasDongle);
});

Inventory.onInventoryUpdate(
  'player',
  async (identifier, action) => {
    let hasDongle = true;
    if (action == 'remove') {
      hasDongle = await Inventory.doesInventoryHaveItems('player', identifier, 'race_creator_dongle');
    }
    const plySource = charModule.getServerIdFromCitizenId(Number(identifier));
    if (!plySource) return;
    Events.emitNet('racing:track:canCreate', plySource, hasDongle);
  },
  'race_creator_dongle'
);

Inventory.onInventoryUpdate(
  'player',
  async (identifier, action) => {
    let hasDongle = true;
    if (action == 'remove') {
      hasDongle = await Inventory.doesInventoryHaveItems('player', identifier, 'race_dongle');
    }
    if (Overwrites.getOverwrite('racing:enableGlobally')) {
      hasDongle = true;
    }
    const plySource = charModule.getServerIdFromCitizenId(Number(identifier));
    if (!plySource) return;
    Events.emitNet('racing:track:canSeeApp', plySource, hasDongle);
  },
  'race_dongle'
);
