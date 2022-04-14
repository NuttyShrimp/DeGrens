import { Vector3 as Vector3Class, Vector4 as Vector4Class } from '../../shared/index';
import * as Classes from '../classes';

declare global {
  let DGCore: Server;
  let DGX: {
    Util: typeof Classes.Util;
    Events: typeof Classes.Events;
    RPC: typeof Classes.RPC;
    Phone: typeof Classes.Phone;
    SQL: typeof Classes.SQL;
    Vector3: typeof Vector3Class;
    Vector4: typeof Vector4Class;
  };
}
