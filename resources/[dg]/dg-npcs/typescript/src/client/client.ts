import './controllers/events';

import handler from 'classes/handler';

setImmediate(() => {
  handler.startThread();
});
