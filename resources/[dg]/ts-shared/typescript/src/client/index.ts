import { returnClassRefs } from '../shared/helpers/library';
// Following code is for DGX.xxx.yyy access
import * as Shared from '../shared/index';

import * as Classes from './classes';

export * from './classes';

const DGX = {
  ...Shared,
  ...Classes,
};

// @ts-ignore
global.DGX = DGX;

setImmediate(() => {
  global.exports('_getLibrary', () => {
    const funcRefs: Record<string, any> = {};
    Object.keys(DGX).forEach(key => {
      const refs = returnClassRefs(DGX[key as keyof typeof DGX]);
      if (!refs) {
        return;
      }
      funcRefs[key] = refs;
    });
    return funcRefs;
  });
});
