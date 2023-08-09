import { Events, Inventory, Notifications, Peek, SyncedObjects, Util } from '@dgx/client';
import { getHouseInfo, getHousesInfo } from 'modules/houses/services/store';

Events.onNet('realestate:placeMailbox', async () => {
  const placeInfo = await Util.startGhostPlacement('prop_letterbox_01', 10);
  if (!placeInfo) {
    Notifications.add('Dat is geen goede plek', 'error');
    return;
  }
  const houses = Object.values(getHousesInfo()).filter(h => h.owned);
  const nearHouse = houses.find(h => h.enter.distance(placeInfo.coords) < 5);
  if (!nearHouse) {
    Notifications.add('Dit is niet bij een huis dat je bezit', 'error');
    return;
  }
  if (nearHouse.has_mailbox) {
    Notifications.add('Dit huis heeft al een brievenbus', 'error');
    return;
  }

  Events.emitNet('realestate:placeMailbox', nearHouse.name, placeInfo.coords, placeInfo.rotation);
});

Peek.addFlagEntry('isMailBox', {
  distance: 2,
  options: [
    {
      icon: 'fas fa-mailbox',
      label: 'Open brievenbus',
      canInteract(ent) {
        if (!ent) return false;
        const houseName = Entity(ent).state.houseName;
        return !!houseName;
      },
      action(_, ent) {
        if (!ent) return;
        const houseName: string = Entity(ent).state.houseName;
        if (!houseName) return false;
        const owned = getHouseInfo(houseName)?.owned;
        Inventory.openStash(
          owned ? `mailbox_${houseName.replace(/ /g, '_')}` : `mailbox_recv_${houseName.replace(/ /g, '_')}`,
          2
        );
      },
    },
  ],
});
