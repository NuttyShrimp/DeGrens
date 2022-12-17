import { startCoordsThread } from 'modules/coords/controller.coords';

import './modules/coords';
import './modules/natives';
import './modules/scopes';

setImmediate(() => {
  startCoordsThread();
});
