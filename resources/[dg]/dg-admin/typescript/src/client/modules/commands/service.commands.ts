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
