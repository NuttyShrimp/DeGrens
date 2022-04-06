import * as Shared from '@shared/index';
import { Classes } from './classes';

const DGX = {
  ...Shared,
  ...Classes,
};

// @ts-ignore
global.DGX = DGX;

setImmediate(() => {
  global.exports('_getLibrary', () => DGX);
});
