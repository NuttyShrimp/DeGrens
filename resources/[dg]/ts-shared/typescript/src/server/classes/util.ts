import { Util as UtilShared } from '../../shared/classes/util';
import { firstNames, lastNames } from '../data/names';

class Util extends UtilShared {
  Notify = (
    src: number,
    text: string,
    type: 'success' | 'error' | 'primary' = 'primary',
    timeout = 5000,
    persistent?: boolean
  ) => {
    emitNet('DGCore:Notify', src, text, type, timeout, persistent);
  };
  generateName = (): string => {
    const firstName = firstNames[this.getRndInteger(0, firstNames.length - 1)];
    const lastName = lastNames[this.getRndInteger(0, lastNames.length - 1)];
    return `${firstName} ${lastName}`;
  };
}

export default {
  Util: new Util(),
};
