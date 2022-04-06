import { Util as UtilShared } from '../../shared/classes/util';

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
}

export default {
  Util: new Util(),
}