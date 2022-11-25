export const drawText3d = (text: string, origin: Vec3, scale: number) => {
  SetTextScale(scale, scale);
  SetTextFont(6);
  SetTextProportional(true);
  SetTextOutline();
  SetTextColour(255, 255, 255, 255);
  BeginTextCommandDisplayText('STRING');
  SetTextCentre(true);
  AddTextComponentSubstringPlayerName(text);
  SetDrawOrigin(origin.x, origin.y, origin.z, 0);
  DrawText(0.0, 0.0);
  ClearDrawOrigin();
};