import { loadPoints, scheduleFallofs } from './service.penaltyPoints';

setImmediate(() => {
  scheduleFallofs();
  loadPoints();
});
