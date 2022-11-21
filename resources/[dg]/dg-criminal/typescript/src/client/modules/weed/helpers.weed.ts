import { Util } from '@dgx/client';

export const lookAtPlant = (entity: number) => {
  const pedCoords = Util.getPlyCoords();
  const entityCoords = Util.getEntityCoords(entity);
  const vector = { x: pedCoords.x - entityCoords.x, y: pedCoords.y - entityCoords.y };
  let heading = Math.atan(vector.y / vector.x);
  heading = (heading * 180) / Math.PI;
  heading = heading + 90;
  if (vector.x < 0) {
    heading = Math.abs(heading) + 180;
  }
  SetEntityHeading(PlayerPedId(), heading);
};
