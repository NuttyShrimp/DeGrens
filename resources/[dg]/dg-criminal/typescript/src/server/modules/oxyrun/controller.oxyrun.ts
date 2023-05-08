import { Events, Inventory, Jobs, RPC, Util } from '@dgx/server';
import {
  giveOxyrunBoxToPlayer,
  handleOxyrunGroupLeave,
  registerOxyrunVehicle,
  resetOxyrunVehicle,
  restoreOxyrunForPlayer,
  sellOxyToBuyer,
  startOxyrunForPlayer,
} from './service.oxyrun';
import { charModule } from 'services/core';

Events.onNet('criminal:oxyrun:start', startOxyrunForPlayer);
RPC.register('criminal:oxyrun:registerVehicle', registerOxyrunVehicle);
Events.onNet('criminal:oxyrun:takeBox', giveOxyrunBoxToPlayer);
RPC.register('criminal:oxyrun:resetVehicle', resetOxyrunVehicle);

Util.onCharSpawn(plyId => {
  restoreOxyrunForPlayer(plyId);
});

Jobs.onGroupLeave((plyId, _, groupId) => {
  handleOxyrunGroupLeave(plyId, groupId);
});

Inventory.onInventoryUpdate(
  'player',
  (identifier, _, itemState) => {
    const { type, identifier: vin } = Inventory.splitId(itemState.inventory);
    if (type !== 'trunk') return;

    const cid = Number(identifier);
    if (isNaN(cid)) return;
    const plyId = charModule.getServerIdFromCitizenId(cid);
    if (!plyId) return;

    // timeout to look nicer in trunk
    setTimeout(() => {
      sellOxyToBuyer(plyId, vin, itemState);
    }, 1000);
  },
  'oxyrun_box',
  'remove'
);