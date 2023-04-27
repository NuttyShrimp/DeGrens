declare namespace Blackout {
  type Config = {
    duration: number;
    safezoneDelay: number;
    powerstations: Powerstation[];
    safezones: Safezone[];
  };

  type Powerstation = { camId: number } & Zones.Box;

  type Safezone = Zones.Poly<{ id: string }>;

  type LocationType = 'powerstation' | 'safezone';

  type Statebag = {
    blackout: boolean;
    safezones: boolean;
  };
}
