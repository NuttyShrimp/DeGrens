export * from './classes';
// Following code is for DGX.xxx.yyy access
import * as Shared from '../shared/index';

import * as Classes from './classes';

const DGX = {
  ...Shared,
  ...Classes,
};

// @ts-ignore
global.DGX = DGX;

setImmediate(() => {
  global.exports('_getLibrary', () => DGX);
});
