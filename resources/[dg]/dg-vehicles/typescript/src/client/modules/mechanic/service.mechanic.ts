import { Events, Notifications } from '@dgx/client';

let clockedIn: string | null = null;
let repairZone: string | null = null;

export const isClockedIn = () => !!clockedIn;

// Returns the shop where the player is in and clocked in (if the same)
export const getCurrentWorkingShop = () => {
  if (!clockedIn) return;
  return clockedIn == repairZone ? clockedIn : undefined;
};

export const setClockInStatus = (pClockedIn: boolean, shop: string) => {
  clockedIn = pClockedIn ? shop : null;
  Notifications.add(clockedIn ? 'Je hebt juist ingeclocked' : 'Je bent juist uitgeclocked');
  Events.emitNet('vehicles:mechanic:setClockStatus', shop, pClockedIn);
};

export const setRepairZone = (zone: string | null) => {
  repairZone = zone;
};

export const isInRepairZone = () => repairZone !== null;
