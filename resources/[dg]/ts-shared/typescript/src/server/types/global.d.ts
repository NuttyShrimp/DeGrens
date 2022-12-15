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
    UI: typeof Classes.UI;
    Jobs: typeof Classes.Jobs;
    Config: typeof Classes.Config;
    Admin: typeof Classes.Admin;
    Inventory: typeof Classes.Inventory;
    Auth: typeof Classes.Auth;
    Financials: typeof Classes.Financials;
    Business: typeof Classes.Business;
    RayCast: typeof Classes.RayCast;
    Gangs: typeof Classes.Gangs;
    Screenshot: typeof Classes.Screenshot;
    Sounds: typeof Classes.Sounds;
    Vehicles: typeof Classes.Vehicles;
    Police: typeof Classes.Police;
    Status: typeof Classes.Status;
    Reputations: typeof Classes.Reputations;
    Sync: typeof Classes.Sync;
    Weapons: typeof Classes.Weapons;
    Weather: typeof Classes.Weather;
    Vector3: typeof Vector3Class;
    Vector4: typeof Vector4Class;
  };
  var asyncExports: any;
}
