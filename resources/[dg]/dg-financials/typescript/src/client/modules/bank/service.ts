import { Events, Peek, RPC, UI } from '@dgx/client';
import locationManager from 'classes/LocationManager';

import { config } from '../../config';

export const registerPeekZones = () => {
  Peek.addFlagEntry(
    'isBanker',
    {
      options: [
        {
          label: 'Neem Paycheck',
          icon: 'fas fa-file-invoice-dollar',
          type: 'server',
          event: 'financials:server:paycheck:give',
        },
        {
          label: 'Open Spaarrekening',
          icon: 'fas fa-book-open',
          action: async () => {
            const result = await UI.openInput({
              header: 'Open Spaarrekening',
              inputs: [{ label: 'Account Naam', name: 'accountName', type: 'text' }],
            });
            if (!result.accepted) return;
            Events.emitNet('financials:bank:savings:create', result.values.accountName);
          },
        },
        {
          label: 'Tickets inbrengen',
          icon: 'fas fa-ticket-simple',
          type: 'server',
          action: () => {
            Events.emitNet('vehicles:mechanic:server:tradeTickets');
          },
        },
      ],
      distance: 3,
    },
    true
  );
  Peek.addModelEntry(
    config.ATMModels,
    {
      options: [
        {
          label: 'ATM',
          icon: 'fas fa-university',
          async action() {
            await doAnimation(true, true);
            locationManager.setAtATM(true);
            const base = await RPC.execute<BaseState>('financials:accounts:open', 'ATM');
            if (!base) return;
            base.isAtm = true;
            UI.openApplication('financials', base);
          },
        },
      ],
      distance: 2.0,
    },
    true
  );
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
  return DGX.Taskbar.create('credit-card', config.animText[isOpen ? 'open' : 'close'], 1000, {
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
