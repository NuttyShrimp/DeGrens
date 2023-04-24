import { startCoordsThread } from 'modules/coords/controller.coords';

import './modules/coords';
import './modules/actions';
import './modules/scopes';

setImmediate(() => {
  startCoordsThread();
});
