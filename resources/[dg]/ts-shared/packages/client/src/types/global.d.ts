import { Vector3 as Vector3Class, Vector4 as Vector4Class } from '../../shared';
import * as Classes from '../classes';

declare global {
  let DGX: {
    UI: typeof Classes.UI;
    Vector3: typeof Vector3Class;
    Vector4: typeof Vector4Class;
    PolyTarget: typeof Classes.PolyTarget;
    Peek: typeof Classes.Peek;
    RayCast: typeof Classes.RayCast;
    PolyZone: typeof Classes.PolyZone;
    Keys: typeof Classes.Keys;
    Util: typeof Classes.Util;
    Events: typeof Classes.Events;
    RPC: typeof Classes.RPC;
    Sync: typeof Classes.Sync;
    Taskbar: typeof Classes.Taskbar;
    Interiors: typeof Classes.Interiors;
    Jobs: typeof Classes.Jobs;
    Inventory: typeof Classes.Inventory;
    PropAttach: typeof Classes.PropAttach;
    Storage: typeof Classes.Storage;
    Particles: typeof Classes.Particles;
    Sounds: typeof Classes.Sounds;
    HUD: typeof Classes.HUD;
    Business: typeof Classes.Business;
    Gangs: typeof Classes.Gangs;
    Minigames: typeof Classes.Minigames;
    Animations: typeof Classes.Animations;
    Police: typeof Classes.Police;
    Weapons: typeof Classes.Weapons;
    Weather: typeof Classes.Weather;
    Hospital: typeof Classes.Hospital;
    Phone: typeof Classes.Phone;
    BaseEvents: typeof Classes.BaseEvents;
    BlipManager: typeof Classes.BlipManager;
    SyncedObjects: typeof Classes.SyncedObjects;
    Npcs: typeof Classes.Npcs;
    Vehicles: typeof Classes.Vehicles;
    Core: typeof Classes.Core;
    Statebags: typeof Classes.Statebags;
  };
  var asyncExports: any;
}
