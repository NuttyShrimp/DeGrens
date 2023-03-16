import { Events, Notifications, Taskbar } from '@dgx/client';

let parachuteThread: NodeJS.Timer | null = null;
const parachuteHash = GetHashKey('GADGET_PARACHUTE');

Events.onNet('misc:parachute:toggle', async () => {
  const [canceled] = await Taskbar.create('parachute-box', '', 20000, {
    canCancel: true,
    cancelOnDeath: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      combat: true,
      carMovement: true,
    },
    animation: {
      animDict: 'clothingshirt',
      anim: 'try_shirt_positive_d',
      flags: 49,
    },
  });
  if (canceled) return;

  if (isParachuteEquipped()) {
    unequipParachute();
  } else {
    equipParachute();
  }
});

const isParachuteEquipped = () => {
  return HasPedGotWeapon(PlayerPedId(), parachuteHash, false);
};

const equipParachute = () => {
  emit('qb-clothing:client:loadOutfit', {
    outfitData: {
      bag: { item: 7, texture: 0 },
    },
  });

  const ped = PlayerPedId();
  GiveWeaponToPed(ped, parachuteHash, 1, false, false);
  Notifications.add('Je hebt nu een parachute aan', 'success');

  parachuteThread = setInterval(() => {
    if (isParachuteEquipped()) return;
    if (GetPedParachuteState(PlayerPedId()) !== -1) return;
    unequipParachute(true);
  }, 1000);
};

const unequipParachute = (outfitChangeDelay = false) => {
  // without delay the auto reequip parachute from native gta fucks up removing backpack
  setTimeout(
    () => {
      emit('qb-clothing:client:loadOutfit', {
        outfitData: {
          bag: { item: 0, texture: 0 },
        },
      });
    },
    outfitChangeDelay ? 3000 : 0
  );

  const ped = PlayerPedId();
  RemoveWeaponFromPed(ped, parachuteHash);
  Notifications.add('Je hebt geen parachute meer aan', 'error');

  if (parachuteThread) {
    clearInterval(parachuteThread);
    parachuteThread = null;
  }
};
