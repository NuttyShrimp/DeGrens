import { Npcs } from '@dgx/client';

let npcs: string[] = [];

export const removeLocations = () => {
  npcs.forEach(id => {
    Npcs.remove(id);
  });
};

export const loadLocations = (locs: Rentals.Location[]) => {
  removeLocations();
  npcs = locs.map(l => {
    const id = `misc_vehiclerentals_${l.id}`;
    Npcs.add({
      id,
      model: 'cs_josef',
      position: l.coords,
      heading: l.coords.w,
      distance: 50.0,
      settings: {
        invincible: true,
        ignore: true,
        freeze: true,
        collision: true,
      },
      flags: {
        isRentalDealer: true,
        rentalSpot: l.id,
      },
      scenario: 'WORLD_HUMAN_CLIPBOARD',
      blip: {
        title: 'Vehicle Rentals',
        sprite: 431,
        color: 7,
      },
    });
    return id;
  });
};
