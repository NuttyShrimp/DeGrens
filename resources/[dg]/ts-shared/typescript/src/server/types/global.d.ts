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
    Chat: typeof Classes.Chat;
    Taskbar: typeof Classes.Taskbar;
    Notifications: typeof Classes.Notifications;
    API: typeof Classes.API;
    Jobs: typeof Classes.Jobs;
    Config: typeof Classes.Config;
    Inventory: typeof Classes.Inventory;
    Vector3: typeof Vector3Class;
    Vector4: typeof Vector4Class;
  };
}
