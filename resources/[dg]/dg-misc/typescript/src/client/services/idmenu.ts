import { Keys, Sync, UI, Util } from '@dgx/client';
import { drawText3d } from 'helpers/util';

let idThread: NodeJS.Timer | null = null;
let keyThread: NodeJS.Timer | null = null;

const openMenu = async () => {
  closeMenu();
  idThread = setInterval(() => {
    GetActivePlayers().forEach((ply: number) => {
      const ped = GetPlayerPed(ply);
      const coords = Util.getEntityCoords(ped);
      coords.z += 1.0;
      drawText3d(`${GetPlayerServerId(ply)}`, coords, 0.4);
    });
  }, 1);
  const scopeInfo = await Sync.getScopeInfo();
  if (!scopeInfo) return;
  UI.openApplication(
    'idlist',
    {
      info: scopeInfo,
    },
    true
  );
  keyThread = setInterval(() => {
    if (IsControlJustPressed(0, 172) || IsDisabledControlJustPressed(0, 172)) {
      UI.SendAppEvent('idlist', {
        direction: 'up',
      });
    }
    if (IsControlJustPressed(0, 173) || IsDisabledControlJustPressed(0, 173)) {
      UI.SendAppEvent('idlist', {
        direction: 'down',
      });
    }
  }, 100);
};

const closeMenu = () => {
  UI.closeApplication('idlist');
  if (idThread) {
    clearInterval(idThread);
    idThread = null;
  }
  if (keyThread) {
    clearInterval(keyThread);
    keyThread = null;
  }
};

Keys.onPressDown('showIdMenu', () => {
  openMenu();
});

Keys.onPressUp('showIdMenu', () => {
  closeMenu();
});

Keys.register('showIdMenu', '(general) Show Id menu', 'U');
