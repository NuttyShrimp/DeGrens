import { UI } from '@dgx/client';

global.exports('close', () => {
  UI.closeApplication('inventory');
});
