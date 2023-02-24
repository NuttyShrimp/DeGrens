import { Events, Inventory, Minigames, Notifications, Peek, Taskbar, UI } from '@dgx/client';

import { getPercentageOfPowerBox, placePlayerAtPowerBox } from './helpers.fleeca';

Peek.addModelEntry(
  'prop_elecbox_10',
  {
    options: [
      {
        icon: 'fas fa-calculator',
        label: 'Signaal Meten',
        items: 'volt_meter',
        action: async (_, powerEntity) => {
          if (!powerEntity) return;
          placePlayerAtPowerBox(powerEntity);
          const [canceled] = await Taskbar.create('bolt', 'Signaal meten', 5000, {
            canCancel: true,
            cancelOnDeath: true,
            disarm: true,
            disableInventory: true,
            controlDisables: {
              carMovement: true,
              movement: true,
              combat: true,
            },
            animation: {
              animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
              anim: 'machinic_loop_mechandplayer',
              flags: 16,
            },
          });
          if (canceled) return;

          // here we dont care about copcheck and returnal of -1
          let amount = await getPercentageOfPowerBox(powerEntity);
          amount = Math.max(0, amount);
          UI.openApplication('contextmenu', [
            {
              title: `Signaalsterkte: ${amount}%`,
              icon: 'bolt',
            },
          ]);
        },
      },
      {
        icon: 'fas fa-bolt',
        label: 'Plaats EMP',
        items: 'mini_emp',
        action: async (_, powerEntity) => {
          if (!powerEntity) return;
          const amount = await getPercentageOfPowerBox(powerEntity);
          if (amount === -1) {
            Notifications.add('Te sterk beveiligd', 'error');
            return;
          }
          if (amount !== 100) {
            Notifications.add('Signaalsterkte te laag', 'error');
            return;
          }
          placePlayerAtPowerBox(powerEntity);
          Inventory.removeItemByNameFromPlayer('mini_emp');
          const hackSuccess = await Minigames.sequencegame(4, 6, 10);
          if (!hackSuccess) return Notifications.add('Mislukt', 'error');
          Events.emitNet('heists:server:fleeca:disablePower');
        },
      },
    ],
    distance: 2,
  },
  true
);
