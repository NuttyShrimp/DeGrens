import { PolyZone, BlipManager } from '@dgx/client';

let zoneBuilt = false;

export const buildKingPillsJobZone = (zone: Vec4) => {
  if (zoneBuilt) {
    destroyKingPillsJobZone();
  }

  BlipManager.addBlip({
    category: 'kingpills_job',
    id: 'kingpills_job_blip',
    coords: zone,
    sprite: 51,
    color: 0,
    text: 'King Pills Job',
  });
  PolyZone.addCircleZone('kingpills_job_zone', zone, 20, { routingBucket: 0, data: {} });
  zoneBuilt = true;
};

export const destroyKingPillsJobZone = () => {
  if (!zoneBuilt) return;

  PolyZone.removeZone('kingpills_job_zone');
  BlipManager.removeBlip('kingpills_job_blip');
};
