declare namespace Lockers {
  type Config = {
    taxId: number;
    debtPercentage: number;
    inventorySize: number;
    debtIntervalInDays: number;
  };

  type Locker = {
    id: string;
    coords: Vec3;
    radius: number;
    owner: number | null;
    password: string | null;
    price: number;
    paymentDay: number;
  };

  type DBLocker = Omit<Locker, 'coords' | 'paymentDay'> & Vec3 & { payment_day: number };

  type BuildData = Pick<Locker, 'id' | 'coords' | 'radius'>;
}
