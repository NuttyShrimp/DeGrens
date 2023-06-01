export const allowedModels: Record<string, (veh: number) => boolean> = {
  ambusprinter1: () => true,
  ambusprinter2: () => true,
  mug: () => true,
  mug2: () => true,
  brvito: () => true,
  brblus: () => true,
  fpskoda: () => true,
  fpm5: () => true,
  wpv90: () => true,
  lpgolf: () => true,
  lpmoto: () => true,
  lpoutlaw: () => true,
  pa6: () => true,
  pt6: () => true,
  a6: veh => IsVehicleExtraTurnedOn(veh, 1),
  '22m5': veh => IsVehicleExtraTurnedOn(veh, 1),
  drafter: veh => IsVehicleExtraTurnedOn(veh, 1),
};
