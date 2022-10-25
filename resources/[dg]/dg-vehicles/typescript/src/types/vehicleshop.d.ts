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
    quicksell: {
      percentage: number;
      allowedUpgrades: (keyof Upgrades.Cosmetic)[];
    };
  };

  type Spot = {
    position: Vec4;
    model: string;
    needsEmployee: boolean;
  };

  type Vehicle = {
    model: string;
  };
}
