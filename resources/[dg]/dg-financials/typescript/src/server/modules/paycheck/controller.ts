import { Util, Events, Inventory, Notifications, TaxIds, Core } from '@dgx/server';
import { isPlyInLoc } from '../bank/helpers/location';
import { addAmountToPaycheck, givePaycheck, seedCache, seedPlyInCache } from './service';
import accountManager from 'modules/bank/classes/AccountManager';
import { getTaxedPrice } from 'modules/taxes/service';

global.exports('addAmountToPaycheck', (cid: number, amount: number, comment: string) =>
  addAmountToPaycheck(cid, amount, comment)
);

RegisterCommand(
  'financials:seed:paycheck',
  () => {
    seedCache();
  },
  true
);

Core.onPlayerLoaded(playerData => {
  seedPlyInCache(playerData.citizenid);
});

onNet('financials:server:paycheck:give', () => {
  if (!isPlyInLoc(source, 'pacific')) {
    Notifications.add(source, 'NEEN NEEF');
    return;
  }
  givePaycheck(source);
});

Events.onNet('financials:tickets:trade', async (plyId: number) => {
  const cid = Util.getCID(plyId);
  const tickets = await Inventory.getItemsWithNameInInventory('player', String(cid), 'sales_ticket');
  if (tickets.length === 0) {
    Notifications.add(plyId, 'Je hebt geen salestickets opzak', 'error');
    return;
  }

  let revenue = 0;
  for (const ticket of tickets) {
    const origin = ticket.metadata.origin as string;
    if (!origin) continue;

    let revenueOfTicket = 0;
    switch (origin) {
      case 'mechanic':
        revenueOfTicket = (await global.exports['dg-vehicles'].calculateSalesTicketsPrice(ticket)) ?? 0;
        break;
      case 'generic':
        revenueOfTicket = ticket.metadata.amount;
        break;
    }

    revenue += Number(revenueOfTicket);
  }

  const account = accountManager.getDefaultAccount(cid);
  if (!account) return;

  const success = await account.paycheck(cid, revenue);
  const clientPrice = getTaxedPrice(revenue, TaxIds.Income, true).taxPrice;
  if (!success) {
    Notifications.add(plyId, `Systeem is gefaald om €${clientPrice} uit te betalen`, 'error');
    return;
  }

  Notifications.add(plyId, `Je hebt €${clientPrice} verdiend aan je tickets`);
  for (const ticket of tickets) {
    Inventory.destroyItem(ticket.id);
  }
});
