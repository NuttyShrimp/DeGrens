import { Vector3, Vector4 } from '@dgx/shared';

export const Plans: Record<string, Buildplan> = {};

// Initial use is apartments, hence the event name
Plans.gabz_apartments_room = {
  shell: 'gabz_pinkcage_ymap_shell',
  saveToCache: true,
  origin: new Vector3(0, 0, 0),
  generator: new Vector3(-334.32, -953.21, -98.9),
  spawnOffset: new Vector4(-3.88, -2.97, -1.28, 0.0),
  modulo: {
    multi: {
      x: 12.0,
      y: 12.0,
      z: -14.0,
    },
    xLimit: 24,
    yLimit: 22,
  },
  interactZone: [
    {
      offset: new Vector3(-4.03, -3.62, -0.78),
      dist: 1.5,
      name: 'exit',
      GeneralUse: {
        label: 'Exit',
        isServer: true,
        event: 'dg-apartments:server:leaveApartment',
      },
      housingMain: {
        label: 'Invite',
        event: 'dg-apartment:inviteMenu',
      },
    },
    {
      offset: new Vector3(-0.1, 2.52, -0.78),
      dist: 1,
      name: 'outfit',
      GeneralUse: {
        label: 'Change Outfit',
        event: 'qb-clothing:client:openOutfitMenu',
      },
    },
  ],
  peek: [
    {
      type: 'model',
      id: 'gabz_pinkcage_bed',
      distance: 1.5,
      options: [
        {
          type: 'server',
          event: 'dg-apartments:server:logOut',
          icon: 'fas fa-sign-out-alt',
          label: 'Logout',
          canInteract: () => global.exports['dg-apartments'].isInApartment(),
        },
      ],
    },
    {
      type: 'model',
      id: 'v_res_tre_storagebox',
      distance: 1.5,
      options: [
        {
          type: 'client',
          event: 'dg-apartment:openStash',
          icon: 'fas fa-box',
          label: 'Open stash',
          canInteract: () => global.exports['dg-apartments'].isInApartment(),
        },
      ],
    },
  ],
};

// Initial use is houserobberies
Plans.standardmotel_shell = {
  shell: 'standardmotel_shell',
  saveToCache: true,
  origin: false,
  generator: new Vector3(-334.32, -953.21, -98.9),
  spawnOffset: new Vector4(-0.176840067, -2.376289, -1.03844154, 271.0),
  modulo: {
    multi: {
      x: 12.0,
      y: 12.0,
      z: -14.0,
    },
    xLimit: 24,
    yLimit: 22,
  },
  interactZone: [
    {
      offset: new Vector3(-0.5204716325, -2.376289, -0.5),
      dist: 1.25,
      name: 'exit',
      GeneralUse: {
        label: 'Exit',
        event: 'dg-houserobbery:leave',
      },
    },
  ],
  targetZone: [
    {
      offset: new Vector3(1.81, -3.27, -0.56),
      length: 1.4,
      width: 0.6,
      options: {
        data: {},
        heading: 0,
        minZ: -1.56,
        maxZ: -0.66,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek kast',
            icon: 'fas fa-search',
            data: {
              name: 'cab_1',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },
    {
      offset: new Vector3(-1.11, 1.17, -0.56),
      length: 0.6,
      width: 0.75,
      options: {
        data: {},
        heading: 0,
        minZ: -1.56,
        maxZ: -0.66,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek kast',
            icon: 'fas fa-search',
            data: {
              name: 'cab_2',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },
    {
      offset: new Vector3(1.46, 3.27, -0.56),
      length: 1.35,
      width: 0.8,
      options: {
        data: {},
        heading: 0,
        minZ: -1.56,
        maxZ: 0.84,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek kast',
            icon: 'fas fa-search',
            data: {
              name: 'cab_3',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },
    {
      offset: new Vector3(-3.17, 3.09, -0.55),
      length: 1.0,
      width: 0.8,
      options: {
        data: {},
        heading: 0,
        minZ: -1.55,
        maxZ: -0.55,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek toilet',
            icon: 'fas fa-search',
            data: {
              name: 'toilet',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },
    {
      offset: new Vector3(-3.25, 1.93, -0.55),
      length: 0.7,
      width: 0.65,
      options: {
        data: {},
        heading: 0,
        minZ: -4.55,
        maxZ: -0.5,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek lavabo',
            icon: 'fas fa-search',
            data: {
              name: 'sink',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },
    {
      offset: new Vector3(-1.12, 1.15, -0.55),
      width: 0.4,
      length: 0.4,
      options: {
        data: {},
        heading: 2,
        minZ: -0.75,
        maxZ: 0.05,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Steel vaas',
            icon: 'fas fa-hand-back-fist',
            data: {
              name: 'vase',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name, 2),
          },
        ],
      },
    },
  ],
};

Plans.furnitured_midapart = {
  shell: 'furnitured_midapart',
  saveToCache: true,
  origin: false,
  generator: new Vector3(-334.32, -953.21, -98.9),
  spawnOffset: new Vector4(1.43482137, -10.1745186, -1.15617156, 0.0),
  modulo: {
    multi: {
      x: 12.0,
      y: 12.0,
      z: -14.0,
    },
    xLimit: 24,
    yLimit: 22,
  },
  interactZone: [
    {
      offset: new Vector3(1.43482137, -10.1745186, 0),
      dist: 1.25,
      name: 'exit',
      GeneralUse: {
        label: 'Exit',
        event: 'dg-houserobbery:leave',
      },
    },
  ],
  targetZone: [
    {
      offset: new Vector3(4.25, -5.62, -0.52),
      width: 0.75,
      length: 0.7,
      options: {
        data: {},
        heading: 0,
        minZ: -1.37,
        maxZ: -0.57,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek kast',
            icon: 'fas fa-search',
            data: {
              name: 'cab_1',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },

    {
      offset: new Vector3(0.5, 1.22, -0.52),
      width: 1.45,
      length: 0.6,
      options: {
        data: {},
        heading: 0,
        minZ: -1.52,
        maxZ: -0.47,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek kast',
            icon: 'fas fa-search',
            data: {
              name: 'cab_2',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },

    {
      offset: new Vector3(6.19, 2.98, -0.52),
      width: 0.65,
      length: 1.45,
      options: {
        data: {},
        heading: 0,
        minZ: -1.52,
        maxZ: -0.67,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek kast',
            icon: 'fas fa-search',
            data: {
              name: 'cab_3',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },

    {
      offset: new Vector3(7.52, 3.99, -0.52),
      width: 1.2,
      length: 0.8,
      options: {
        data: {},
        heading: 0,
        minZ: -1.52,
        maxZ: -0.72,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek kist',
            icon: 'fas fa-search',
            data: {
              name: 'kist',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },

    {
      offset: new Vector3(5.99, 10.12, -0.52),
      width: 1.0,
      length: 1.4,
      options: {
        data: {},
        heading: 0,
        minZ: -1.52,
        maxZ: 0.88,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek kast',
            icon: 'fas fa-search',
            data: {
              name: 'kast_1',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },

    {
      offset: new Vector3(3.54, 7.89, -0.52),
      width: 0.7,
      length: 0.6,
      options: {
        data: {},
        heading: 0,
        minZ: -1.52,
        maxZ: -0.62,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek kast',
            icon: 'fas fa-search',
            data: {
              name: 'cab_4',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },

    {
      offset: new Vector3(1.54, 8.72, -0.52),
      width: 0.75,
      length: 0.65,
      options: {
        data: {},
        heading: 0,
        minZ: -1.52,
        maxZ: -0.47,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek kast',
            icon: 'fas fa-search',
            data: {
              name: 'cab_5',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },

    {
      offset: new Vector3(0.78, 7.18, -0.52),
      width: 0.9,
      length: 0.6,
      options: {
        data: {},
        heading: 0,
        minZ: -1.52,
        maxZ: -0.92,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek mandjes',
            icon: 'fas fa-search',
            data: {
              name: 'baskets_1',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },

    {
      offset: new Vector3(-7.75, 6.19, -0.52),
      width: 2.35,
      length: 0.2,
      options: {
        data: {},
        heading: 0,
        minZ: -0.72,
        maxZ: 0.88,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Steel TV',
            icon: 'fas fa-hand-back-fist',
            data: {
              name: 'tv',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name, 1),
          },
        ],
      },
    },

    {
      offset: new Vector3(-4.24, -1.17, -0.52),
      width: 0.4,
      length: 0.85,
      options: {
        data: {},
        heading: 0,
        minZ: -1.52,
        maxZ: -0.92,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Doorzoek mandjes',
            icon: 'fas fa-search',
            data: {
              name: 'basket_2',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name),
          },
        ],
      },
    },

    {
      offset: new Vector3(-0.38, 0.74, -0.52),
      width: 0.55,
      length: 0.35,
      options: {
        data: {},
        heading: 0,
        minZ: -0.57,
        maxZ: -0.17,
      },
      entries: {
        distance: 1.5,
        options: [
          {
            label: 'Steel microgolfoven',
            icon: 'fas fa-hand-back-fist',
            data: {
              name: 'microwave',
            },
            canInteract: (_, __, e) => global.exports['dg-houserobbery'].canLootZone(e.data.name),
            action: e => global.exports['dg-houserobbery'].lootZone(e.data.name, 3),
          },
        ],
      },
    },
  ],
};

// I spawn this shit using vec3 position so all the generator modulo bullshit is not needed
// Couldnt be bother to figure out how that works to be honest
Plans.container_shell = {
  shell: 'container_shell',
  saveToCache: true,
  spawnOffset: new Vector4(0.0, -5.23, 0, 0),
  interactZone: [
    {
      offset: new Vector3(0.0, -5.23, 0),
      dist: 1.5,
      name: 'exit',
      GeneralUse: {
        label: 'Exit',
        event: 'materials:containers:leave',
      },
    },
    {
      offset: new Vector3(0.0, 5.23, 0),
      dist: 2.5,
      name: 'crafting',
      GeneralUse: {
        label: 'Bench',
        event: 'materials:containers:open',
      },
    },
  ],
} as unknown as Buildplan;
