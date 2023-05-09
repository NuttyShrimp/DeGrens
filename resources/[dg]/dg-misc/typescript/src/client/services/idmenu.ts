import { Events, Keys, RPC, UI, Util } from '@dgx/client';

let isOpen = false;

const openMenu = async () => {
  if (isOpen) return;
  isOpen = true;

  // Merged all rpc calls in 1 general evt
  const data = await RPC.execute<IdList.Data>('misc:idlist:getData');
  if (!data) return;
  const { scopeInfo, isAdmin, hiddenPlys } = data;

  // Double check after events if should still be open. Can happen when insta let go off button
  if (!isOpen) return;

  UI.openApplication(
    'idlist',
    {
      info: scopeInfo,
    },
    true
  );

  let players: { id: number; coords: Vec3 }[] = [];
  const playersThread = setInterval(() => {
    if (!isOpen) {
      clearInterval(playersThread);
      return;
    }

    players = [];
    const ownPed = PlayerPedId();
    const ownCoords = Util.getEntityCoords(ownPed);
    for (const ply of GetActivePlayers()) {
      const plyId = GetPlayerServerId(ply);
      if (hiddenPlys.includes(plyId)) continue;

      const ped = GetPlayerPed(ply);
      const coords = Util.getEntityCoords(ped);
      if (ped !== ownPed && !isAdmin) {
        // Check by distance
        const distance = ownCoords.distance(coords);
        if (distance > 20) continue;

        // Check by LOS
        const hasLos = HasEntityClearLosToEntity(ownPed, ped, 17);
        if (!hasLos) continue;
      }

      coords.z += 1.0;
      players.push({ id: plyId, coords });
    }
  }, 2);

  const drawThread = setInterval(() => {
    if (!isOpen) {
      clearInterval(drawThread);
      return;
    }

    for (const ply of players) {
      Util.drawText3d(`${ply.id}`, ply.coords, 0.4);
    }

    // Handle moving up and down
    if (IsControlJustPressed(0, 188) || IsDisabledControlJustPressed(0, 188)) {
      UI.SendAppEvent('idlist', {
        direction: 'up',
      });
    }
    if (IsControlJustPressed(0, 187) || IsDisabledControlJustPressed(0, 187)) {
      UI.SendAppEvent('idlist', {
        direction: 'down',
      });
    }
  }, 1);
};

const closeMenu = () => {
  UI.closeApplication('idlist');
  Events.emitNet('misc:idlist:close');
  isOpen = false;
};

Keys.onPressDown('showIdMenu', () => {
  openMenu();
});

Keys.onPressUp('showIdMenu', () => {
  closeMenu();
});

Keys.register('showIdMenu', '(general) show id menu (hold)', 'U');
