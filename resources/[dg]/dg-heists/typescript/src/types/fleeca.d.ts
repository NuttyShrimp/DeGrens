declare namespace Fleeca {
  type Config = {
    reenablePowerDelay: number;
    powerLocations: Vec3[];
  };

  type Id = 'fleeca_bp' | 'fleeca_motel' | 'fleeca_benny' | 'fleeca_lifeinvader' | 'fleeca_highway' | 'fleeca_sandy';

  type CanDisable = 'correctLocation' | 'incorrectLocation' | 'unfulfilledRequirements';
}
