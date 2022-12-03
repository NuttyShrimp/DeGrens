// TODO: Maybe move a to scale depending on distance from origin
export const drawText3d = (text: string, origin: Vec3, scale: number, hasBackground = false, textFont = 6) => {
  SetTextScale(scale, scale);
  SetTextFont(textFont);
  SetTextProportional(true);
  SetTextOutline();
  SetTextColour(255, 255, 255, 255);
  BeginTextCommandDisplayText('STRING');
  SetTextCentre(true);
  AddTextComponentSubstringPlayerName(text);
  SetDrawOrigin(origin.x, origin.y, origin.z, 0);
  DrawText(0.0, 0.0);
  if (hasBackground) {
    const factor = text.length / 370;
    DrawRect(0.0, 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 75);
  }
  ClearDrawOrigin();
};
