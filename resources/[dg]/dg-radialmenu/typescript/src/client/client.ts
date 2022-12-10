import { loadEntries } from 'services/radialmenu';

import './controllers';

setImmediate(() => {
  loadEntries();
});
