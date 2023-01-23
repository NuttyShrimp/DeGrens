import './services/signin';
import './services/amountcache';
import './controllers';
import './modules';

setImmediate(() => {
  emitNet('dg-jobs:client:groups:loadStore');
});
