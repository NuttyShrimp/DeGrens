import { Util, Jobs, Events, Inventory, Notifications, TaxIds } from '@dgx/server';
import { isPlyInLoc } from '../bank/helpers/location';
import { checkInterval, givePaycheck, registerPaycheck, seedCache, seedPlyInCache } from './service';
import accountManager from 'modules/bank/classes/AccountManager';
import { getTaxedPrice } from 'modules/taxes/service';

global.exports('registerPaycheck', (cid: number, amount: number, job: string, comment?: string) =>
  registerPaycheck(cid, amount, job, comment)
);

RegisterCommand(
  'financials:seed:paycheck',
  () => {
    seedCache();
  },
  true
);

Util.onPlayerLoaded(playerData => {
  seedPlyInCache(playerData.citizenid);
  checkInterval(playerData.citizenid, Jobs.getCurrentJob(playerData.source));
});

Jobs.onJobUpdate((plyId, job) => {
  const cid = Util.getCID(plyId);
  checkInterval(cid, job);
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
