declare namespace Fleeca {
  type Config = {
    ids: Id[];
    powerLocations: Vec3[];
  };

  type Id = 'fleeca_bp' | 'fleeca_motel' | 'fleeca_benny' | 'fleeca_lifeinvader' | 'fleeca_highway' | 'fleeca_sandy';

  interface Power {
    location: Vec3;
    disabled: boolean;
  }
}
