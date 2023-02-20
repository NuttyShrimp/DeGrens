export * from './classes';
export * from './decorators';
import './helpers/asyncExports';

import { Util as UtilClass } from './classes';

export const Util = new UtilClass();
