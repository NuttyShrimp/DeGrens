import { Events, Financials, Inventory, Notifications, TaxIds, UI, Util } from '@dgx/server';

const PRICES: Record<Justice.CityHall.PaymentType, number> = {
  bank: 100,
  cash: 150,
};

Events.onNet('justice:cityhall:openMenu', src => {
  UI.openContextMenu(src, [
    {
      title: 'Koop nieuw ID',
      icon: 'address-card',
      submenu: [
        {
          title: `Betaal cash: €${PRICES.cash}`,
          callbackURL: 'justice/cityhall/buyId',
          icon: 'euro-sign',
          data: { type: 'cash' },
        },
        {
          title: `Betaal bank: €${Financials.getTaxedPrice(PRICES.bank, TaxIds.Goederen).taxPrice}`,
          callbackURL: 'justice/cityhall/buyId',
          icon: 'euro-sign',
          data: { type: 'bank' },
        },
      ],
    },
  ]);
});

Events.onNet('justice:cityhall:buyId', async (src, type: Justice.CityHall.PaymentType) => {
  if (type !== 'bank' && type !== 'cash') return;

  const cid = Util.getCID(src);
  if (!cid) return;

  if (type === 'bank') {
    const plyDefAcc = Financials.getDefaultAccountId(cid);
    if (!plyDefAcc) return;
    const success = await Financials.purchase(plyDefAcc, cid, PRICES.bank, `Aankoop nieuwe ID kaart`, TaxIds.Goederen);
    if (!success) {
      Notifications.add(src, 'Heb je te weinig geld op je rekening staan?', 'error');
      return;
    }
  } else {
    const success = Financials.removeCash(src, PRICES.cash, 'aankoop-nieuwe-id-card');
    if (!success) {
      Notifications.add(src, 'Je hebt te weinig cash geld', 'error');
      return;
    }
  }

  Inventory.addItemToPlayer(src, 'id_card', 1);
});
