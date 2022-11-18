import { Financials, Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface GiveCashData {
  Target?: UI.Player;
  amount?: string;
}

export const giveCash: CommandData = {
  name: 'giveCash',
  log: 'gave cash to someone',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, data: GiveCashData) => {
    try {
      const amount = parseInt(data.amount ?? '0');
      if (amount < 1) {
        Notifications.add(caller.source, 'Amount cannot be empty and should be higher than 0', 'error');
        return;
      }
      Financials.addCash(data?.Target?.serverId ?? caller.source, amount, `admin menu action by ${caller.name}`);
    } catch (e) {
      console.error(e);
      Notifications.add(caller.source, 'Amount should be a number', 'error');
    }
  },
  UI: {
    title: 'Give Cash',
    info: {
      inputs: [Inputs.Player],
      overrideFields: ['amount'],
    },
  },
};
