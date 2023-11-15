let blipIds: number[] = [];

export const showingBlips = () => {
  return blipIds.length > 0;
};

export const clearBlips = () => {
  SetGpsMultiRouteRender(false);
  ClearGpsMultiRoute();
  blipIds.forEach(blip => {
    if (!DoesBlipExist(blip)) return;
    RemoveBlip(blip);
  });
  blipIds = [];
};

export const showRaceBlips = (checkpoints: Racing.Checkpoint[], current: number, multiLap = false) => {
  clearBlips();
  // Get the following 3 checkpoints
  ClearGpsMultiRoute();
  StartGpsMultiRoute(21, true, true);
  SetGpsMultiRouteRender(true);
  const startOffset = Math.min(Math.max(current, 0), checkpoints.length - 1);
  for (let i = 0; i < 3 && i + startOffset < checkpoints.length; i++) {
    const idx = i + startOffset;
    const point = checkpoints[idx];
    if (!point) continue;
    const blip = AddBlipForCoord(point.center.x, point.center.y, point.center.z);

    if (idx === 0) {
      SetBlipSprite(blip, 38);
      SetBlipColour(blip, 4);
      AddTextComponentSubstringPlayerName(`Start`);
    } else if (idx === checkpoints.length - 1) {
      SetBlipSprite(blip, 38);
      SetBlipColour(blip, 4);
      AddTextComponentSubstringPlayerName(`Finish Line`);
    } else {
      SetBlipSprite(blip, 1);
      SetBlipColour(blip, 7);
      AddTextComponentSubstringPlayerName(`Checkpoint`);
    }
    SetBlipDisplay(blip, 4);
    SetBlipAsShortRange(blip, true);
    AddPointToGpsMultiRoute(point.center.x, point.center.y, point.center.z);

    blipIds.push(blip);
  }
  const firstBlip = blipIds.at(0);
  if (!firstBlip) return;
  SetBlipRouteColour(firstBlip, 7);
  SetBlipRoute(firstBlip, true);
};

export const showBlipsForCheckpoints = (points: Racing.Checkpoint[], multiLap = false) => {
  if (blipIds.length > 0) {
    clearBlips();
  }
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const blip = AddBlipForCoord(point.center.x, point.center.y, point.center.z);

    SetBlipDisplay(blip, 4);
    SetBlipScale(blip, 0.8);
    SetBlipAsShortRange(blip, true);
    ShowNumberOnBlip(blip, i + 1);
    BeginTextCommandSetBlipName('STRING');
    if (i === 0) {
      SetBlipSprite(blip, 38);
      SetBlipColour(blip, 4);
      AddTextComponentSubstringPlayerName(`Start`);
    } else if (i === points.length - 1 && !multiLap) {
      SetBlipSprite(blip, 38);
      SetBlipColour(blip, 4);
      AddTextComponentSubstringPlayerName(`Finish Line`);
    } else {
      SetBlipSprite(blip, 1);
      SetBlipColour(blip, 5);
      AddTextComponentSubstringPlayerName(`Checkpoint`);
    }
    EndTextCommandSetBlipName(blip);

    blipIds.push(blip);
  }
};
