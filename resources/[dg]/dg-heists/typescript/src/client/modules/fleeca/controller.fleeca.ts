import { Events, Notifications, Peek, UI, Taskbar } from '@dgx/client';
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

          const amount = await getPercentageOfPowerBox(powerEntity);
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
          const amount = await getPercentageOfPowerBox(powerEntity);
          if (amount !== 100) {
            Notifications.add('Signaalsterkte te laag.');
            return;
          }
          placePlayerAtPowerBox(powerEntity);
          DGCore.Functions.TriggerCallback('DGCore:RemoveItem', 'mini_emp', 1);
          global.exports['dg-sequencegame'].OpenGame(
            async (success: boolean) => {
              if (!success) return Notifications.add('Mislukt', 'error');
              Events.emitNet('heists:server:fleeca:disablePower');
            },
            4,
            6
          );
        },
      },
    ],
    distance: 2,
  },
  true
);
