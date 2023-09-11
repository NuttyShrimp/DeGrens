declare namespace VehicleShop {
  type Config = {
    businessName: string;
    taxId: number;
    shopZone: { vectors: Vec2[]; minZ: number; maxZ: number };
    carSpots: Omit<Spot, 'needsEmployee'>[];
    vehicleSpawnLocation: Vec4;
    testDrive: {
      depositPercentage: number;
      time: number;
    };
    timeForSale: number;
    classesThatNeedEmployee: Vehicles.Class[];
    employeeTicket: {
      percentage: number;
      min: number;
      max: number;
    };
    quicksell: {
      percentage: number;
      allowedUpgrades: (keyof Vehicles.Upgrades.Cosmetic)[];
    };
    kofiShopVehicleSpawn: Vec4;
  };

  type Spot = {
    position: Vec4;
    model: string;
  };

  type Vehicle = {
    model: string;
  };
}
