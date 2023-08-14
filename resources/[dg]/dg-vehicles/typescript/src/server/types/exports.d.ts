declare interface ServerExports {
  vehicles: {
    setFuelLevel(vehicle: number, fuelLevel: number);

    isVinFromPlayerVeh(vin: string): boolean;
    getNetIdOfVin(vin: string): number | null;
    getVehicleOfVin(vin: string): number | null;

    blockVinInBennys: (vin: string) => void;
  };
}
