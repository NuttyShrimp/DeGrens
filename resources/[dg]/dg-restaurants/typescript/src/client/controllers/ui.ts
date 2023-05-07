import { Events, UI } from '@dgx/client';
import { doCreateItem } from 'services/actions';
import { removeItemFromNewOrder, showNewOrderMenu, addItemToNewOrder, confirmNewOrder } from 'services/order';

UI.RegisterUICallback(
  'restaurant/removeOrderItem',
  (data: { itemIdx: number; restaurantId: string; registerId: number }, cb) => {
    removeItemFromNewOrder(data.itemIdx);
    showNewOrderMenu(data.restaurantId, data.registerId);
    cb({ data: {}, meta: { ok: true, message: 'done' } });
  }
);

UI.RegisterUICallback(
  'restaurant/addOrderItem',
  (data: { itemName: string; restaurantId: string; registerId: number }, cb) => {
    addItemToNewOrder(data.itemName);
    showNewOrderMenu(data.restaurantId, data.registerId);
    cb({ data: {}, meta: { ok: true, message: 'done' } });
  }
);

UI.RegisterUICallback('restaurant/confirmOrder', (data: { restaurantId: string; registerId: number }, cb) => {
  confirmNewOrder(data.restaurantId, data.registerId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('restaurant/payBill', (data: { restaurantId: string; registerId: number }, cb) => {
  Events.emitNet('restaurants:register:payBill', data.restaurantId, data.registerId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('restaurant/cancelOrder', (data: { restaurantId: string; registerId: number }, cb) => {
  Events.emitNet('restaurants:register:cancelOrder', data.restaurantId, data.registerId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('restaurant/finishOrder', (data: { restaurantId: string; registerId: number }, cb) => {
  Events.emitNet('restaurants:register:finishOrder', data.restaurantId, data.registerId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback(
  'restaurant/createItem',
  (data: { restaurantId: string; registerId: number; item: string; keygameAmount: number }, cb) => {
    doCreateItem(data.restaurantId, data.registerId, data.item, data.keygameAmount);
    cb({ data: {}, meta: { ok: true, message: 'done' } });
  }
);

UI.RegisterUICallback('restaurant/buyLeftover', (data: { restaurantId: string; item: string }, cb) => {
  Events.emitNet('restaurants:location:buyLeftover', data.restaurantId, data.item);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
