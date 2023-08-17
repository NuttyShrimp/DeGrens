import { Business, Notifications, Util } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/src/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { Restaurant } from './restaurant';
import config from 'services/config';

@EventListener()
@RPCRegister()
class RestaurantManager extends Util.Singleton<RestaurantManager>() {
  private readonly logger: winston.Logger;
  private restaurants: Record<string, Restaurant>;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'Manager' });
    this.restaurants = {};
  }

  // Wrapper func to get restaurant with logs if doesnt exist
  public getRestaurant = (restaurantId: string) => {
    const restaurant = this.restaurants[restaurantId];
    if (!restaurant) {
      const logMsg = `Tried to get restaurant with invalid id '${restaurantId}'`;
      Util.Log('restaurants:invalidId', { restaurantId }, logMsg, undefined, true);
      this.logger.error(logMsg);
      return;
    }
    return restaurant;
  };

  // Wrapper func to get restaurant obj but log if ply not inside
  private getRestaurantAndValidatePlayer = (plyId: number, restaurantId: string, logAction: string) => {
    const restaurant = this.getRestaurant(restaurantId);
    if (!restaurant) return;
    if (!Business.isPlayerInside(plyId, restaurant.id)) {
      const logMsg = `${Util.getName(plyId)}(${plyId}) tried '${logAction}' at ${restaurant} but was not inside`;
      this.logger.warn(logMsg);
      Util.Log('restaurants:notInRestaurant', { restaurantId }, logMsg, plyId, true);
      Notifications.add(plyId, 'Je bent niet in een restaurant!', 'error');
      return;
    }
    return restaurant;
  };

  public loadRestaurants = () => {
    for (const id of Object.keys(config.restaurants)) {
      const restaurant = new Restaurant(id);
      this.restaurants[id] = restaurant;
    }
  };

  @DGXEvent('restaurants:register:checkBill')
  private _checkRegisterBill = (plyId: number, restaurantId: string, registerId: number) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'check register bill');
    if (!restaurant) return;
    restaurant.checkRegisterBill(plyId, registerId);
  };

  @DGXEvent('restaurants:register:payBill')
  private _payRegisterBill = (plyId: number, restaurantId: string, registerId: number) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'pay register bill');
    if (!restaurant) return;
    restaurant.payRegisterBill(plyId, registerId);
  };

  @RPCEvent('restaurant:register:hasOrder')
  private _hasOrder = (plyId: number, restaurantId: string, registerId: number) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'check order');
    if (!restaurant) return;
    return restaurant.doesRegisterHaveOrder(registerId);
  };

  @DGXEvent('restaurants:register:setOrder')
  private _setOrder = (plyId: number, restaurantId: string, registerId: number, items: string[]) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'set order');
    if (!restaurant) return;
    restaurant.setOrder(plyId, registerId, items);
  };

  @DGXEvent('restaurants:register:cancelOrder')
  private _cancelOrder = (plyId: number, restaurantId: string, registerId: number) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'cancel order');
    if (!restaurant) return;
    restaurant.cancelRegisterOrder(plyId, registerId);
  };

  @DGXEvent('restaurants:register:finishOrder')
  private _finishOrder = (plyId: number, restaurantId: string, registerId: number) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'finish order');
    if (!restaurant) return;
    restaurant.finishRegisterOrder(plyId, registerId);
  };

  @RPCEvent('restaurant:location:getMenuItems')
  private _getMenuItems = (plyId: number, restaurantId: string) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'get menu items');
    if (!restaurant) return;
    return restaurant.getMenuItems();
  };

  @RPCEvent('restaurant:register:showOrder')
  private _showOrder = (plyId: number, restaurantId: string, registerId: number): boolean => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'show order');
    if (!restaurant) return false;
    const shown = restaurant.showActiveOrder(plyId, registerId);
    return shown;
  };

  @DGXEvent('restaurants:location:cook')
  private _doCooking = (plyId: number, restaurantId: string, fromItem: string) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'cooking');
    if (!restaurant) return;
    restaurant.doCooking(plyId, fromItem);
  };

  @DGXEvent('restaurants:location:showCreateMenu')
  private _showCreateItemMenu = (plyId: number, restaurantId: string, fromItem: string) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'showing create menu');
    if (!restaurant) return;
    restaurant.showCreateItemMenu(plyId, fromItem);
  };

  @DGXEvent('restaurants:location:createItem')
  private _createItem = (plyId: number, restaurantId: string, registerId: number, item: string) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'creating item');
    if (!restaurant) return;
    restaurant.createItem(plyId, registerId, item);
  };

  @DGXEvent('restaurants:location:showLeftover')
  private _showLeftover = (plyId: number, restaurantId: string) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'showing leftovers');
    if (!restaurant) return;
    restaurant.showLeftover(plyId);
  };

  @DGXEvent('restaurants:location:buyLeftover')
  private _buyLeftover = (plyId: number, restaurantId: string, item: string) => {
    const restaurant = this.getRestaurantAndValidatePlayer(plyId, restaurantId, 'buying leftovers');
    if (!restaurant) return;
    restaurant.buyLeftover(plyId, item);
  };
}

const restaurantManager = RestaurantManager.getInstance();
export default restaurantManager;
