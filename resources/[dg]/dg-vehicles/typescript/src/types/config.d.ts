declare namespace Config {
  type Shop = 'pdm' | 'nfs';

  type Car = {
    name: string;
    brand: string;
    model: string;
    category: Category;
    class: Vehicles.Class;
    type: Vehicle.VehicleType;
  };

  type CarSchema = Car & {
    hash: number;
    price: number;
    defaultStock: number;
    /**
     * Given in days
     */
    restockTime: number;
    shop: Shop;
    inCarboostPool: boolean;
  };
}
