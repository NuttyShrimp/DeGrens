import { Gangs, Inventory, Notifications, Npcs, SyncedObjects, UI, Util } from '@dgx/server';
import { getXP } from './xpSystem';

let objIds: string[] = [];

const NPC_DATA = {
  distance: 50,
  model: 's_m_y_blackops_02',
  blip: {
    title: 'Restock',
    color: 2,
    sprite: 110,
  },
  settings: {
    ignore: true,
    invincible: true,
    collision: true,
    freeze: true,
  },
  flags: {
    isCTMRestock: true,
  },
};

const WEAPON_TYPES: Record<string, Record<string, string>> = {
  bandage: {
    ammo: 'kingpills_pressure_bandage',
  },
  armor: {
    ammo: 'armor',
  },
  syringe: {
    ammo: 'morphine_syringe',
  },
  pistol: {
    weapon: 'weapon_pistol',
    ammo: 'pistol_ammo',
  },
  tec9: {
    weapon: 'weapon_machinepistol',
    ammo: 'smg_ammo',
  },
  smg: {
    weapon: 'weapon_smg',
    ammo: 'smg_ammo',
  },
  assault: {
    weapon: 'weapon_carbinerifle',
    ammo: 'rifle_ammo',
  },
};

export const initRestockZones = async () => {
  Npcs.add([
    {
      id: 'ctm_event_restock_1',
      position: { x: 201.4194, y: -995.0558, z: 30.0919, w: 69.6773 },
      ...NPC_DATA,
    },
    {
      id: 'ctm_event_restock_2',
      position: { x: -1166.8037, y: -698.8656, z: 21.9021, w: 212.7576 },
      ...NPC_DATA,
    },
    {
      id: 'ctm_event_restock_3',
      position: { x: 1149.7372, y: 2668.0112, z: 38.1467, w: 359.5226 },
      ...NPC_DATA,
    },
  ]);
  objIds = await SyncedObjects.add([
    {
      coords: { x: 200.6872100830078, y: -994.9341430664062, z: 29.539812088012695 },
      rotation: { x: 0, y: 0, z: 75.0 },
      model: 'prop_ven_market_table1',
      skipStore: true,
    },
    {
      coords: { x: -1166.3218994140625, y: -699.2958374023438, z: 21.32940101623535 },
      rotation: {
        x: -2.874679,
        y: -0.743181,
        z: -44.0186465,
      },
      model: 'prop_ven_market_table1',
      skipStore: true,
    },
    {
      coords: { x: 1149.7071533203125, y: 2668.76953125, z: 37.486209869384766 },
      rotation: { x: -8.1032013, y: 0.003933, z: 0.0002786 },
      model: 'prop_ven_market_table1',
      skipStore: true,
    },
  ]);
};

export const cleanupObjects = () => {
  SyncedObjects.remove(objIds);
  objIds = [];
  Npcs.remove(['ctm_event_restock_1', 'ctm_event_restock_2', 'ctm_event_restock_3']);
};

export const openRestockMenu = (src: number) => {
  const cid = Util.getCID(src);
  const menu: ContextMenu.Entry[] = [
    {
      title: 'Drukverband',
      icon: 'bandage',
      callbackURL: 'event/ctm/restockAmmo',
      data: {
        type: 'bandage',
      },
    },
    {
      title: 'Armor',
      icon: 'vest',
      callbackURL: 'event/ctm/restockAmmo',
      data: {
        type: 'armor',
      },
    },
    {
      title: 'Morphine Syringe',
      icon: 'syringe',
      callbackURL: 'event/ctm/restockAmmo',
      data: {
        type: 'syringe',
      },
    },
    {
      title: 'Pistol',
      icon: 'gun',
      callbackURL: 'event/ctm/restockWeapon',
      data: {
        type: 'pistol',
      },
    },
    {
      title: 'Pistol Ammo',
      icon: 'crate-empty',
      callbackURL: 'event/ctm/restockAmmo',
      data: {
        type: 'pistol',
      },
    },
  ];
  const plyXP = getXP(cid);
  if (plyXP >= 20) {
    menu.push({
      title: 'Tec-9',
      icon: 'gun',
      callbackURL: 'event/ctm/restockWeapon',
      data: {
        type: 'tec9',
      },
    });
    if (plyXP >= 50) {
      menu.push({
        title: 'SMG',
        icon: 'gun',
        callbackURL: 'event/ctm/restockWeapon',
        data: {
          type: 'smg',
        },
      });
    }
    menu.push({
      title: 'SMG Ammo',
      icon: 'crate-empty',
      callbackURL: 'event/ctm/restockAmmo',
      data: {
        type: 'smg',
      },
    });
  }
  if (plyXP > 100) {
    menu.push(
      {
        title: 'M4',
        icon: 'gun',
        callbackURL: 'event/ctm/restockWeapon',
        data: {
          type: 'assault',
        },
      },
      {
        title: 'Rifle Ammo',
        icon: 'crate-empty',
        callbackURL: 'event/ctm/restockAmmo',
        data: {
          type: 'assault',
        },
      }
    );
  }
  UI.openContextMenu(src, menu);
};

export const restockWeapon = (src: number, weapon: string, type: string) => {
  const cid = Util.getCID(src);
  if (type === 'weapon' && Gangs.isPlayerInGang(cid)) {
    Notifications.add(src, 'Ik geef geen wapens aan gangsters', 'error');
    return;
  }
  const item = WEAPON_TYPES?.[weapon]?.[type];
  if (!item) {
    Notifications.add(src, 'Ongeldig wapen', 'error');
    return;
  }
  Inventory.addItemToPlayer(src, item, type === 'ammo' ? 5 : 1);
};
