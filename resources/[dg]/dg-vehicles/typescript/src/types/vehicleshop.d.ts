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
    classesThatNeedEmployee: CarClass[];
    employeePercentage: number;
    quicksell: {
      percentage: number;
      allowedUpgrades: (keyof Vehicles.Upgrades.Cosmetic)[];
    };
  };

  type Spot = {
    position: Vec4;
    model: string;
  };

  type Vehicle = {
    model: string;
  };
}
