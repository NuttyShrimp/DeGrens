import { Events, Inventory, Keys, Notifications, Peek, PolyZone } from '@dgx/client';
import { doCheckin, setAtCheckin } from './service.job';

Peek.addZoneEntry('hospital_shop', {
  options: [
    {
      label: 'Open Ziekenhuis Shop',
      icon: 'fas fa-basket-shopping',
      job: 'ambulance',
      action: () => {
        Inventory.openShop('hospital_shop');
      },
    },
  ],
});

Peek.addZoneEntry('hospital_locker', {
  options: [
    {
      label: 'Open Locker',
      icon: 'fas fa-shelves',
      job: 'ambulance',
      action: () => {
        const cid = LocalPlayer.state.citizenid;
        const stashId = `hospital_locker_${cid}`;
        Inventory.openStash(stashId, 50);
      },
    },
  ],
});

PolyZone.onEnter('hospital_checkin', () => {
  setAtCheckin(true);
});
PolyZone.onLeave('hospital_checkin', () => {
  setAtCheckin(false);
});

Keys.onPressDown('GeneralUse', () => {
  doCheckin();
});

let askedAssistence = false;
on('hospital:assistence', () => {
  if (askedAssistence) {
    Notifications.add('Je dit net gedaan, even geduld', 'error');
    return;
  }

  askedAssistence = true;
  Events.emitNet('hospital:job:assistence');
  Notifications.add('Je hebt een melding verzonden naar de politie', 'success');

  setTimeout(() => {
    askedAssistence = false;
  }, 15000);
});
