export * from './classes';
export * from './decorators';
import './helpers/asyncExports';
import './helpers/deleteEntity';

import { Util as UtilClass } from './classes';

export const Util = new UtilClass();
