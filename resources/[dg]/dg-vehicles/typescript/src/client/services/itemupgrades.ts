import { Events, Peek, Notifications, UI, PolyZone, Vehicles } from '@dgx/client';
import { hasVehicleKeys } from '../modules/keys/cache.keys';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';

let controllerMenuOpen = false;
let inZone = false;

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Plaats Neon',
      icon: 'fas fa-lightbulb',
      items: 'neon_strip',
      action: (_, entity) => {
        if (!entity) return;

        if (!inZone) {
          Notifications.add('Je hebt hier niet de juiste tools', 'error');
          return;
        }

        Events.emitNet('vehicles:itemupgrades:install', NetworkGetNetworkIdFromEntity(entity), 'neon');
      },
      canInteract: veh => {
        if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
        return hasVehicleKeys(veh);
      },
    },
    {
      label: 'Installeer Xenon',
      icon: 'fas fa-lightbulb',
      items: 'xenon_lights',
      action: (_, entity) => {
        if (!entity) return;

        if (!inZone) {
          Notifications.add('Je hebt hier niet de juiste tools', 'error');
          return;
        }

        Events.emitNet('vehicles:itemupgrades:install', NetworkGetNetworkIdFromEntity(entity), 'xenon');
      },
      canInteract: ent => {
        if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
        return Vehicles.isNearVehiclePlace(ent, 'front', 2) && hasVehicleKeys(ent);
      },
    },
  ],
  distance: 2,
});

Events.onNet(
  'vehicles:itemupgrades:loadZone',
  (zone: { center: Vec3; length: number; width: number; heading: number }) => {
    PolyZone.addBoxZone('itemupgrades', zone.center, zone.width, zone.length, {
      heading: zone.heading,
      minZ: zone.center.z - 2,
      maxZ: zone.center.z + 3,
      data: {},
    });
  }
);

PolyZone.onEnter('itemupgrades', () => {
  inZone = true;
});
PolyZone.onLeave('itemupgrades', () => {
  inZone = false;
});

UI.onUIReload(() => {
  controllerMenuOpen = false;
});

UI.onApplicationClose(() => {
  if (!controllerMenuOpen) return;

  controllerMenuOpen = false;

  const vehicle = getCurrentVehicle(true);
  if (!vehicle) {
    Notifications.add('Kon veranderingen niet opslaan...', 'error');
    return;
  }

  const upgrades = upgradesManager.getByKeys(vehicle, ['neon', 'xenon']);
  if (!upgrades) return;
  Events.emitNet('vehicles:itemupgrades:save', NetworkGetNetworkIdFromEntity(vehicle), upgrades);
}, 'contextmenu');

Events.onNet('vehicles:itemupgrades:openMenu', (installedItems: Vehicles.ItemUpgrade[]) => {
  const menuEntries: ContextMenu.Entry[] = [
    {
      title: 'RGB Controller Menu',
      description: 'Beheer je geinstalleerde mods!',
      icon: 'lightbulb',
    },
  ];

  for (const item of installedItems) {
    menuEntries.push(MENU_ENTRIES[item]);
  }

  controllerMenuOpen = true;
  UI.openApplication('contextmenu', menuEntries);
});

UI.RegisterUICallback('itemupgrades/toggle', (data: { item: 'neon' | 'xenon'; id?: number }, cb) => {
  if (!controllerMenuOpen) return;

  const veh = getCurrentVehicle(true);
  if (!veh) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }

  if (data.item === 'neon' && data.id !== undefined) {
    const currentState = upgradesManager.getByKeys(veh, ['neon'])?.neon.enabled.find(x => x.id === data.id);
    if (!currentState) return;
    upgradesManager.setByKey(veh, 'neon', { enabled: [{ id: data.id, toggled: !currentState.toggled ?? false }] });
  } else if (data.item === 'xenon') {
    const currentState = upgradesManager.getByKeys(veh, ['xenon'])?.xenon;
    upgradesManager.setByKey(veh, 'xenon', { active: !currentState?.active ?? false });
  }

  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback(
  'itemupgrades/set',
  (data: { item: 'neon'; value: RGB } | { item: 'xenon'; value: number }, cb) => {
    if (!controllerMenuOpen) return;
    const veh = getCurrentVehicle();
    if (!veh || !isDriver()) {
      Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
      return;
    }

    if (data.item === 'neon') {
      upgradesManager.setByKey(veh, 'neon', { color: data.value });
    } else if (data.item === 'xenon') {
      upgradesManager.setByKey(veh, 'xenon', { color: data.value });
    }

    cb({ data: {}, meta: { ok: true, message: '' } });
  }
);

const XENON_COLORS: [string, number][] = [
  ['Default', -1],
  ['White', 0],
  ['Blue', 1],
  ['Electric Blue', 2],
  ['Mint Green', 3],
  ['Lime Green', 4],
  ['Yellow', 5],
  ['Golden Shower', 6],
  ['Orange', 7],
  ['Red', 8],
  ['Pony Pink', 9],
  ['Hot Pink', 10],
  ['Purple', 11],
  ['Blacklight', 12],
];

const NEON_SIDES: [string, number][] = [
  ['Left', 0],
  ['Right', 1],
  ['Front', 2],
  ['Back', 3],
];

const NEON_COLORS: [string, RGB][] = [
  ['White', { r: 222, g: 222, b: 255 }],
  ['Blue', { r: 2, g: 21, b: 255 }],
  ['Electric Blue', { r: 3, g: 83, b: 255 }],
  ['Mint Green', { r: 0, g: 255, b: 140 }],
  ['Lime Green', { r: 94, g: 255, b: 1 }],
  ['Yellow', { r: 255, g: 255, b: 0 }],
  ['Golden Shower', { r: 255, g: 150, b: 0 }],
  ['Orange', { r: 255, g: 62, b: 0 }],
  ['Red', { r: 255, g: 1, b: 1 }],
  ['Pony Pink', { r: 255, g: 50, b: 100 }],
  ['Hot Pink', { r: 255, g: 5, b: 190 }],
  ['Purple', { r: 31, g: 1, b: 255 }],
  ['Blacklight', { r: 15, g: 3, b: 255 }],
];

const MENU_ENTRIES: Record<Vehicles.ItemUpgrade, { title: string; submenu: ContextMenu.Entry[] }> = {
  xenon: {
    title: 'Xenon',
    submenu: [
      {
        title: 'Toggle On/Off',
        icon: 'toggle-on',
        callbackURL: 'itemupgrades/toggle',
        preventCloseOnClick: true,
        data: {
          item: 'xenon',
        },
      },
      {
        title: 'Change Color',
        icon: 'palette',
        submenu: [
          ...XENON_COLORS.map(([title, value]) => ({
            title,
            callbackURL: 'itemupgrades/set',
            preventCloseOnClick: true,
            data: {
              item: 'xenon',
              value,
            },
          })),
        ],
      },
    ],
  },
  neon: {
    title: 'Neon',
    submenu: [
      {
        title: 'Toggle On/Off',
        icon: 'toggle-on',
        submenu: [
          ...NEON_SIDES.map(([title, value]) => ({
            title,
            callbackURL: 'itemupgrades/toggle',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              id: value,
            },
          })),
        ],
      },
      {
        title: 'Change Color',
        icon: 'palette',
        submenu: [
          ...NEON_COLORS.map(([title, value]) => ({
            title,
            callbackURL: 'itemupgrades/set',
            preventCloseOnClick: true,
            data: {
              item: 'neon',
              value,
            },
          })),
        ],
      },
    ],
  },
};
