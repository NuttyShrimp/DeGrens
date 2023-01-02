let npcs: string[] = [];

export const removeLocations = () => {
  npcs.forEach(id => {
    global.exports['dg-npcs'].removeNpc(id);
  });
};

export const loadLocations = (locs: Rentals.Location[]) => {
  removeLocations();
  npcs = locs.map(l => {
    const id = `misc_vehiclerentals_${l.id}`;
    npcs.push(id);
    global.exports['dg-npcs'].addNpc({
      id,
      model: 'cs_josef',
      position: l.coords,
      heading: l.coords.w,
      distance: 20.0,
      settings: [
        {
          type: 'invincible',
          active: true,
        },
        {
          type: 'ignore',
          active: true,
        },
        {
          type: 'freeze',
          active: true,
        },
        {
          type: 'collision',
          active: true,
        },
      ],
      flags: [
        {
          name: 'isRentalDealer',
          active: true,
        },
        {
          name: 'rentalSpot',
          active: l.id,
        },
      ],
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
