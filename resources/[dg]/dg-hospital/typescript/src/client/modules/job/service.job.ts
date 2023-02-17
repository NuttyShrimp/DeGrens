import { Events, Jobs, Notifications, PolyTarget, PolyZone, Taskbar, UI, Keys, BlipManager } from '@dgx/client';

let atCheckin = false;
export const setAtCheckin = (val: boolean) => {
  atCheckin = val;

  if (atCheckin) {
    UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Inchecken`);
  } else {
    UI.hideInteraction();
  }
};

export const buildJobConfig = (jobConfig: Hospital.Config['job']) => {
  PolyTarget.addCircleZone('hospital_shop', jobConfig.shopLocation, 0.5, { useZ: true, data: {} });
  PolyTarget.addCircleZone('hospital_locker', jobConfig.lockerLocation, 0.6, { useZ: true, data: {} });

  PolyZone.addBoxZone(
    'hospital_checkin',
    jobConfig.checkinZone.center,
    jobConfig.checkinZone.length,
    jobConfig.checkinZone.width,
    {
      heading: jobConfig.checkinZone.heading,
      minZ: jobConfig.checkinZone.minZ,
      maxZ: jobConfig.checkinZone.maxZ,
      data: {},
    }
  );

  BlipManager.addBlip({
    id: 'hospital-pillbox',
    category: 'hospital',
    coords: jobConfig.checkinZone.center,
    text: 'Pillbox Hospital',
    sprite: 61,
    color: 0,
    scale: 0.8,
    isShortRange: true,
  });
};

export const doCheckin = async () => {
  if (!atCheckin) return;
  Events.emitNet('hospital:job:checkin');
};
