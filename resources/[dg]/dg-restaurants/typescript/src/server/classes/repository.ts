import { SQL, Util } from '@dgx/server';

class Repository extends Util.Singleton<Repository>() {
  public updateItemPrice = (restaurantId: string, item: string, price: number) => {
    SQL.query(
      'INSERT INTO restaurant_prices (restaurant, item, price) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE price = VALUES(price)',
      [restaurantId, item, price]
    );
  };

  public getItemPrices = async (restaurantId: string) => {
    return await SQL.query<{ item: string; price: number }[]>(
      'SELECT item, price FROM restaurant_prices WHERE restaurant = ?',
      [restaurantId]
    );
  };

  public deleteItemPrices = (restaurantId: string, items: string[]) => {
    if (items.length === 0) return;
    SQL.query('DELETE FROM restaurant_prices WHERE restaurant = ? AND item in (?)', [restaurantId, items.join(', ')]);
  };
}

const repository = Repository.getInstance();
export default repository;
