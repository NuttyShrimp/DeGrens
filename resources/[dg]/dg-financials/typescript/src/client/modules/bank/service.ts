import { LocationManager } from '../../classes/LocationManager';
import { config } from '../../config';
import { RPC } from '@dgx/client';

const peekIds: Record<string, number[]> = {};

export const registerPeekZones = () => {
  const LManager = LocationManager.getInstance();
  peekIds.paycheck = DGX.Peek.addFlagEntry('isBanker', {
    options: [
      {
        label: 'paycheck',
        icon: 'fas fa-file-invoice-dollar',
        type: 'server',
        event: 'financials:server:paycheck:give',
      },
    ],
    distance: 2.5,
  });
  peekIds.atm = DGX.Peek.addModelEntry(config.ATMModels, {
    options: [
      {
        label: 'ATM',
        icon: 'fas fa-university',
        async action() {
          await doAnimation(true, true);
          LManager.setAtATM(true);
          const base = await RPC.execute<BaseState>('financials:accounts:open', 'ATM');
          base.isAtm = true;
          DGX.UI.openApplication('financials', base);
          SetNuiFocus(true, true);
        },
      },
    ],
    distance: 2.0,
  });
};

export const unregisterPeekZones = () => {
  DGX.Peek.removeFlagEntry(peekIds.paycheck);
  DGX.Peek.removeModelEntry(peekIds.atm);
};

export const doAnimation = async (isAtm: boolean, isOpen: boolean) => {
  const anim: TaskBar.Animation = isAtm
    ? isOpen
      ? {
          anim: 'idle_b',
          flags: 49,
          animDict: 'amb@prop_human_atm@male@idle_a',
        }
      : {
          anim: 'exit',
          flags: 49,
          animDict: 'amb@prop_human_atm@male@exit',
        }
    : {
        anim: 'givetake1_a',
        flags: 49,
        animDict: 'mp_common',
      };
  return DGX.Taskbar.create(config.animText[isOpen ? 'open' : 'close'], 1000, {
    canCancel: false,
    cancelOnDeath: true,
    controlDisables: {
      carMovement: true,
      combat: true,
      movement: true,
    },
    animation: anim,
  });
};
