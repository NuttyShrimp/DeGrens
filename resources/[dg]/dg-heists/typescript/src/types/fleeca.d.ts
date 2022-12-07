declare namespace Fleeca {
  type Config = {
    power: Vec3[];
  };

  type Id = 'fleeca_bp' | 'fleeca_motel' | 'fleeca_benny' | 'fleeca_lifeinvader' | 'fleeca_highway' | 'fleeca_sandy';

  interface Location {
    id: Id;
    label: string;
    laptop: Laptop.Location;
  }
}
