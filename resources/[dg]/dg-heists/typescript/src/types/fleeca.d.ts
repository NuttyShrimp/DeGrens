declare namespace Fleeca {
  type Id = 'fleeca_bp' | 'fleeca_motel' | 'fleeca_benny' | 'fleeca_lifeinvader' | 'fleeca_highway' | 'fleeca_sandy';

  interface Power {
    location: Vec3;
    disabled: boolean;
  }
}
