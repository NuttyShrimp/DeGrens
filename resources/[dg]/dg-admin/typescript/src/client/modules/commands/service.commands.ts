import { Util, UI, Notifications } from '@dgx/client';

let localVisThread: NodeJS.Timer | null = null;

export const toggleLocalVis = (cloak: boolean) => {
  if (!cloak) {
    if (localVisThread) {
      const ped = PlayerPedId();
      clearInterval(localVisThread);
      localVisThread = null;
      SetEntityAlpha(ped, 255, false);
    }
  } else {
    localVisThread = setInterval(() => {
      const ped = PlayerPedId();
      SetEntityLocallyVisible(ped);
      if (GetEntityAlpha(ped) !== 102) {
        SetEntityAlpha(ped, 102, false);
      }
    }, 0);
  }
};

export const copyEntityCoordsToClipboard = (ent?: number) => {
  ent = ent ?? PlayerPedId();
  const coords: Vec4 = { ...Util.getEntityCoords(ent), w: GetEntityHeading(ent) };
  for (const key of Object.keys(coords) as (keyof Vec4)[]) {
    coords[key] = Util.round(coords[key], 4);
  }

  UI.addToClipboard(JSON.stringify(coords));
  Notifications.add('Added coords to clipboard');
};
