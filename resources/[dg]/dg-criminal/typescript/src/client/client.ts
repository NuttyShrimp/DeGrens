import { startPlantsThread } from 'modules/weed/service.weed';

import './modules/cornerselling';
import './modules/weed';

setImmediate(() => {
  startPlantsThread();
});
